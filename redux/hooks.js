import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as actions from './actions';


export const usePlogs = plogIds => {
  let unloadedIds = [];
  const plogData = useSelector(state => state.logs.plogData);
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
