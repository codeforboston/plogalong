import {
  LOG_PLOG,
  SET_CURRENT_USER,
  PLOGS_UPDATED,
  LOCAL_PLOGS_UPDATED,
  PLOG_LOGGED,
  LOG_PLOG_ERROR,
  LIKE_PLOG,
  LIKE_PLOG_ERROR,
  LOAD_HISTORY,
  LOAD_LOCAL_HISTORY,
} from "../actionTypes";

import { specUpdate, revert, updateInCopy } from '../../util/redux';


const initialState = {
  // Look up a plog by ID
  plogData: {},
  history: [],
  localPlogs: [],
  historyLoading: false,
  localPlogsLoading: false,
};

/**
 * @param {typeof initialState} state
 * @returns {typeof initialState}
 */
const log = (state = initialState, action) => {
  const {type, payload} = action;

    switch (type) {
    case LOG_PLOG:
      return { ...state, submitting: payload.plog, logError: null };

    case PLOG_LOGGED:
      return { ...state, submitting: null };

    case LOG_PLOG_ERROR:
      return { ...state, submitting: null, logError: action.error };

    case SET_CURRENT_USER:
      return payload.user ? state : { ... state, history: [] };

    case LOAD_HISTORY: {
      return { ...state, historyLoading: true };
    }

    case LOAD_LOCAL_HISTORY: {
      return { ...state, localPlogsLoading: true };
    }

    case PLOGS_UPDATED:
    case LOCAL_PLOGS_UPDATED: {
      const {plogs = [], prepend, replace} = payload;
      const k = type === PLOGS_UPDATED ? 'history' : 'localPlogs';
      const plogIds = plogs.map(p => p.id);
      const current = state[k];
      let updated = current;

      if (prepend) {
        const idx = plogIds.indexOf(current[0]);
        if (idx > 0)
          updated = plogIds.slice(0, idx).concat(current);
      } else if (replace) {
        updated = plogIds;
      } else if (plogIds.length) {
        updated = current.concat(plogIds);
      }

      return {
        ...state,
        [k]: updated,
        [`${k}Loading`]: false,
        plogData: {
          ...state.plogData,
          ...plogs.reduce((pd, plog) => { pd[plog.id] = plog; return pd; }, {})
        }
      };
    }

    case LIKE_PLOG:
      return updateInCopy(state, ['plogData', payload.plogID, 'likeCount'], count => count+(payload.like ? 1 : -1), 0);
      // return specUpdate(state, ['plogData', payload.plogID, 'likeCount'], 0, count => (payload.like ? count+1 : count-1));

    case LIKE_PLOG_ERROR:
      // return revert(state, ['plogData', payload.plogID, 'likeCount']);

    default:
      return state;
    }
};

export default log;
