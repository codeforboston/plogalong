import { fromJS } from "immutable";

import {
    LOG_PLOG,
    SET_CURRENT_USER,
  PLOGS_UPDATED,
  LOCAL_PLOGS_UPDATED,
} from "../actionTypes";

const initialState = fromJS({
    // Look up a plog by ID
    history: [],
    localPlogs: [],
});

const log = (state = initialState, action) => {
    switch (action.type) {
    case LOG_PLOG: {
        return state.update(
            "history",
            (history) => history.push(
                fromJS(action.payload)
            )
        );
    }

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
