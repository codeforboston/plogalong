import { Map, fromJS } from "immutable";
import * as types from "../actionTypes";

export default usersReducer = (state = Map(), {type, payload}) => {
  switch (type) {
    case types.SET_CURRENT_USER:
      return state.set("current", fromJS(payload.user))
                  .set("init", true);

    case types.SIGNUP_ERROR:
      return state.set("signupError", fromJS(payload.error));

    case types.LOGIN_ERROR:
        return state.set("loginError", fromJS(payload.error));

    default: {
      return state;
    }
  }
};
