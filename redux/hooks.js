import { useMemo } from 'react';
import * as redux from 'redux';
import * as reactRedux from 'react-redux';

import * as actions from './actions';

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
  let unloadedIds = [];
  const plogData = useSelector(state => state.log.plogData);
  const dispatch = useDispatch();

  const plogs = useMemo(() => {
    const ids = Array.isArray(plogIds) ? plogIds : [plogIds];
    return ids.map(id => {
      if (!plogData[id]) {
        unloadedIds.push(id);
        return { id, status: 'loading' };
      }

      return plogData[id];
    });
  }, [plogData, plogIds]);

  if (unloadedIds.length) {
    // Request for the plogs to be loaded
    dispatch(actions.loadPlogs(unloadedIds));
  }

  return Array.isArray(plogIds) ? plogs : plogs[0];
};
