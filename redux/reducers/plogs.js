import { LOG_PLOG } from "../actionTypes";

const initialState = {
    // Look up a plog by ID
    byIds: {},
    history: []
};

let localId = 0;

const log = (state = initialState, action) => {
    // TODO Convert to immutablejs
    switch (action.type) {
    case LOG_PLOG: {
        return {
            // byIds: {
            //     ...state.byIds,
            //     [++localId]: action.payload
            // },
            history: [
                ...state.history,
                action.payload
                // localId
            ]
        };
    }
    default: {
        return state;
    }
    }
};

export default log;
