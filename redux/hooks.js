import { useCallback, useMemo, useState } from 'react';
import * as redux from 'redux';
import * as reactRedux from 'react-redux';

import * as actions from './actions';
import { useEffectWithPrevious } from '../util/react';

/** @typedef {typeof import('./reducers/index.js').default} RootReducer  */
/**
 * @template T
 * @typedef {T extends redux.Reducer<infer S> ? S : never} Associated
 */

/** @typedef {Associated<RootReducer>} AppState */

export const useDispatch = reactRedux.useDispatch;

/** @type {<TSelected=unknown>(selector: (state: AppState) => TSelected, equalityFn?: (left: TSelected, right: TSelected) => boolean) => TSelected} */
export const useSelector = reactRedux.useSelector;

export const usePlogs = plogIds => {
  const plogData = useSelector(state => state.log.plogData);
  const dispatch = useDispatch();

  // Signal to middleware to unsubscribe from updates to these plogs
  useEffectWithPrevious((oldIDs) => {
    if (oldIDs) {
      const unloadIDs = new Set(oldIDs);
      for (const id of plogIds) {
        unloadIDs.delete(id);
      }
      if (unloadIDs.size) {
        dispatch(actions.unloadPlogs(Array.from(unloadIDs)));
      }
    }

    // On unmount, unsubscribe from updates
    return () => {
      if (plogIds) {
        dispatch(actions.unloadPlogs(plogIds));
      }
    };
  }, [plogIds]);

  return useMemo(() => {
    const ids = Array.isArray(plogIds) ? plogIds : plogIds ? [plogIds] : [];
    let unloadedIds = [];

    const plogs = ids.map(id => {
      if (!plogData[id]) {
        unloadedIds.push(id);
        return { id, status: 'loading' };
      }

      return plogData[id];
    });

    if (unloadedIds.length) {
      // Request for the plogs to be loaded
      dispatch(actions.loadPlogs(unloadedIds));
    }

    return plogs;
  }, [plogData, plogIds]);
};

export const usePlog = (plogId) => {
  const plogs = usePlogs(plogId ? [plogId] : []);

  return plogs[0];
};

/**
 * Given a list of plog IDs, loads the plog data in increments of `perPage`.
 * Returns a tuple containing: an array of plogs (including those currently
 * being loaded); a boolean indicating if plogs are currently being loaded; and
 * a function that will load the next "page".
 *
 * @param {string[]} plogIDs
 * @param {number} perPage
 */
export function usePaginatedPlogs(plogIDs, perPage=3) {
  const [offset, setOffset] = useState(perPage);
  const plogs = usePlogs(plogIDs.slice(0, offset));
  const loading = !!plogs.find(plog => plog.status === 'loading');

  useCallback(() => {
    setOffset(Math.min(offset, plogIDs.length));
  }, [plogIDs]);

  const loadNext = useCallback(() => {
    if (!loading && offset < plogIDs.length) {
      setOffset(Math.min(plogIDs.length, offset+perPage));
    }
  }, [loading, offset]);

  return /** @type {[typeof plogs, boolean, () => void]} */([plogs, loading, loadNext]);
};
