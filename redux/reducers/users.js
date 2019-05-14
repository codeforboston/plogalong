import { Map, fromJS } from "immutable";
import { SET_CURRENT_USER } from "../actionTypes";

export default usersReducer = (state = Map(), action) => {
  switch (action.type) {
    case SET_CURRENT_USER: {
      return state.set("current", fromJS(action.payload.user));
    }

    default: {
      return state;
    }
  }
};
