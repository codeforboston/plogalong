import { SET_PREFERENCES } from "../actionTypes";

export default preferences = (state = {}, action) => {
    switch (action.type) {
        case SET_PREFERENCES: {
          return {
            ...state,
            ...action.payload.preferences
          };
        }

        default: {
            return state;
        }
    }
};
