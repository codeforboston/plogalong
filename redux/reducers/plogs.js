import { fromJS } from "immutable";

import { LOG_PLOG } from "../actionTypes";

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
    default: {
        return state;
    }
    }
};

export default log;
