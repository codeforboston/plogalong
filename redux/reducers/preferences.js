import { Map, fromJS } from "immutable";
import { SET_PREFERENCES } from "../actionTypes";

export default preferences = (state = Map(), action) => {
    switch (action.type) {
        case SET_PREFERENCES: {
            return state.merge(fromJS(action.payload.preferences));
        }

        default: {
            return state;
        }
    }
};
