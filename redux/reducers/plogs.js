import { fromJS, Seq } from "immutable";

import {
    LOG_PLOG,
    SET_CURRENT_USER,
  PLOGS_UPDATED,
  LOCAL_PLOGS_UPDATED,
  PLOG_LOGGED,
  LOG_PLOG_ERROR,
  LIKE_PLOG,
  LIKE_PLOG_ERROR,
} from "../actionTypes";

import { specUpdate, revert } from '../../util/redux';


/** @type {import('immutable').Map} */
const initialState = fromJS({
  // Look up a plog by ID
  plogData: {},
  history: [],
  localPlogs: [],
});

const log = (state = initialState, action) => {
  const {type, payload} = action;

    switch (action.type) {
    case LOG_PLOG:
      return state.merge({ submitting: payload.plog, logError: null });

    case PLOG_LOGGED:
      return state.set("submitting", null);

    case LOG_PLOG_ERROR:
      return state.merge({ submitting: null, logError: action.error });

    case SET_CURRENT_USER: {
        if (!payload.user)
            return state.set(
                "history",
                fromJS([]));

        return state;
    }

    case PLOGS_UPDATED:
    case LOCAL_PLOGS_UPDATED: {
      const {plogs = []} = payload;
      const newState = state.set(
        action.type === PLOGS_UPDATED ? 'history' : 'localPlogs',
        Seq(plogs).map(p => p.id)
      )
        .mergeIn(['plogData'], Seq(payload.plogs).map(plog => ([plog.id, fromJS(plog)])));
      return newState;
    }

    case LIKE_PLOG:
      return specUpdate(state, ['plogData', payload.plogID, 'likeCount'], 0, count => (payload.like ? count+1 : count-1));

    case LIKE_PLOG_ERROR:
      return revert(state, ['plogData', payload.plogID, 'likeCount']);

    default:
      return state;
    }
};

export default log;
