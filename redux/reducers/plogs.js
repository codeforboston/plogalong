import { fromJS } from "immutable";

import {
    LOG_PLOG,
    UPDATE_PLOGS,
} from "../actionTypes";

const initialState = fromJS({
    // Look up a plog by ID
    history: []
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
    case UPDATE_PLOGS: {
        return state.update(
            "history",
            (history) => history.push(
                ...action.payload.plogs.map((plog) => fromJS(plog))
            )
        )
    }
    default: {
        return state;
    }
    }
};

export default log;
