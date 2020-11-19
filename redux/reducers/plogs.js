import {
  LOG_PLOG,
  SET_CURRENT_USER,
  PLOGS_UPDATED,
  PLOG_LOGGED,
  LOG_PLOG_ERROR,
  LIKE_PLOG,
  LIKE_PLOG_ERROR,
  LOAD_HISTORY,
  LOCAL_HISTORY_LOADING,
  DELETE_PLOG,
  PLOG_DELETED,
  PLOG_DATA,
  SET_REGION,
  LOCAL_PLOG_IDS,
} from "../actionTypes";

import { specUpdate, revert, updateInCopy } from '../../util/redux';

/** @typedef {import('../../firebase/plogs').Plog} Plog */
/** @typedef {{ id: Plog["id"], status: 'loading'|'deleted'|'error', error?: Error }} PlogStub */
/** @typedef {Plog | PlogStub} LocalPlogState */

const initialState = {
  // Look up a plog by ID
  /** @type {Object<string, LocalPlogState>} */
  plogData: {},
  /** @type {string[]} */
  history: [],
  /** @type {string[]} */
  localPlogs: [],
  /** @type {import('../../firebase/regions').RegionData} */
  region: null,
  historyLoading: false,
  localPlogsLoading: false,
  submitting: null,
  /** @type {string} */
  lastPlogID: null, // the ID of the last plog saved from this client since the app started
  logError: null,
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
      return { ...state, lastPlogID: payload.plogID, submitting: null };

    case LOG_PLOG_ERROR:
      return { ...state, submitting: null, logError: action.error };

    case SET_CURRENT_USER:
      return payload.user ? state : { ... state, history: [] };

    case LOAD_HISTORY: {
      return { ...state, historyLoading: true };
    }

    case LOCAL_HISTORY_LOADING: {
      return {
        ...state,
        localPlogsLoading: true,
      };
    }

    case PLOG_DATA: {
      const { plogs = [] } = payload;

      return {
        ...state,
        plogData: {
          ...state.plogData,
          ...plogs.reduce((pd, plog) => { pd[plog.id] = plog; return pd; }, {})
        }
      };
    }

    case LOCAL_PLOG_IDS: {
      return {
        ...state,
        localPlogs: action.payload.plogIDs,
        localPlogsLoading: false
      };
    }

    case PLOGS_UPDATED: {
      const {plogs = [], idList: plogIds, disposition, removed} = payload;
      const k = /** @type {'history'|'localPlogs'} */(payload.listType);
      let { [k]: updated, plogData } = state;
      let plogDataCopied = false;

      if (plogs.length) {
        plogData = {
          ...plogData,
          ...plogs.reduce((pd, plog) => { pd[plog.id] = plog; return pd; }, {})
        };
        plogDataCopied = true;
      }

      for (const id of plogIds) {
        if (plogData[id])
          continue;

        if (!plogDataCopied) {
          plogData = { ...plogData };
          plogDataCopied = true;
        }

        plogData[id] = { id, status: 'loading' };
      }


      if (disposition === 'replace') {
        if (updated.length || plogIds.length)
          updated = plogIds;
      } else if (plogIds.length) {
        if (disposition === 'prepend') {
          updated = Array.from(new Set(plogIds.concat(updated)));
        } else {
          updated = Array.from(new Set(updated.concat(plogIds)));
        }
      }

      if (removed.length) {
        for (const plogID of removed)
          delete plogData[plogID];
      }

      return {
        ...state,
        [k]: updated,
        [`${k}Loading`]: false,
        plogData
      };
    }

    case DELETE_PLOG: {
      return updateInCopy(state, ['plogData', payload.id, '_deleting'], () => true);
    }

    case PLOG_DELETED: {
      const { plogData, history, localPlogs, ...rest } = state;

      return {
        plogData: {
          ...plogData,
          [payload.plogID]: undefined
        },
        history: history.filter(id => id !== payload.plogID),
        localPlogs: localPlogs.filter(id => id !== payload.plogID),
        ...rest
      };
    }

    case LIKE_PLOG:
      return specUpdate(state, ['plogData', payload.plogID, 'likeCount'], count => count + (payload.like ? 1 : -1), 0);

    case LIKE_PLOG_ERROR:
      return revert(state, ['plogData', payload.plogID, 'likeCount']);

    case SET_REGION:
      return {
        ...state,
        region: payload.region
      };

    default:
      return state;
    }
};

export default log;
