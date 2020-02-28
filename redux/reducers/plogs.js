import { fromJS } from "immutable";

import {
    LOG_PLOG,
    SET_CURRENT_USER,
  PLOGS_UPDATED,
  LOCAL_PLOGS_UPDATED,
  PLOG_LOGGED,
  LOG_PLOG_ERROR,
} from "../actionTypes";

const initialState = fromJS({
    // Look up a plog by ID
    history: [],
    localPlogs: [],
});

const log = (state = initialState, action) => {
    switch (action.type) {
    case LOG_PLOG:
      return state.merge({ submitting: action.payload.plog, logError: null });

    case PLOG_LOGGED:
      return state.set("submitting", null);

    case LOG_PLOG_ERROR:
      return state.merge({ submitting: null, logError: action.error });

    case SET_CURRENT_USER: {
        if (!action.payload.user)
            return state.set(
                "history",
                fromJS([]));

        return state;
    }

    case PLOGS_UPDATED: {
        return state.set(
            "history",
            fromJS(action.payload.plogs)
        );
    }

    case LOCAL_PLOGS_UPDATED: {
        return state.set(
            "localPlogs",
            fromJS(action.payload.plogs)
        );
    }
    default: {
        return state;
    }
    }
};

export default log;
