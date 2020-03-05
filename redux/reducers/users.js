import { Map, fromJS } from "immutable";
import * as types from "../actionTypes";

import { specUpdate, revert } from '../../util/redux';


export default usersReducer = (state = Map(), {type, payload}) => {
  switch (type) {
    case types.SET_CURRENT_USER: {
        let current = fromJS(payload.user);
        if (payload.user)
            current = current.set('data', state.getIn(['users', payload.user.uid, 'data'], fromJS({})));
        return state.set("current", current)
            .set("init", true);

      }
    case types.USER_DATA: {
        return state.setIn(payload.uid === state.getIn(['current', 'uid']) ?
                           ['current', 'data'] :
                           ['users', payload.UserID, 'data'],
                          fromJS(payload.data));
    }

  case types.LIKE_PLOG:
    return specUpdate(state, ['current', 'data', 'likedPlogs', payload.plogID],
                      payload.like);

  case types.LIKE_PLOG_ERROR:
    return revert(state, ['current', 'data', 'likedPlogs', payload.plogID]);

    case types.LOCATION_CHANGED: {
        return state.set('location', payload.location);
    }

  case types.SIGNUP:
    return state.merge({ signupError: null });

    case types.SIGNUP_ERROR:
      return state.set("signupError", fromJS(payload.error));

    case types.LOGIN_ERROR:
        return state.set("loginError", fromJS(payload.error));

    default: {
      return state;
    }
  }
};
