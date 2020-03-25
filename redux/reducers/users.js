import * as types from "../actionTypes";

import { specUpdate, revert, updateInCopy } from '../../util/redux';
import { updateAchievements, updateStats } from '../../firebase/project/functions/shared';
import { plogStateToDoc } from '../../firebase/plogs';


/** @typedef {string} UserID */
/**
 * @typedef {object} UserData
 */
/**
 * @typedef {object} User
 * @property {UserData} [data]
 * @property {UserID} uid
 */

/** @typedef {{ current?: User, users: { [k in UserID]: User} }} UserState */

const initialState = {
  current: null,
  users: {},
  location: null,
  locationInfo: null
};

/**
 * @param {UserState} state
 *
 * @returns {UserState}
 */
export default usersReducer = (state = initialState, {type, payload}) => {
  switch (type) {
    case types.SET_CURRENT_USER: {
      /** @type {User} */
      const user = payload.user;
      return {
        ...state,
        current: user ? {
          ...user,
          data: state.users[user.uid] || {}
        } : null
      };
    }
    case types.USER_DATA: {
      return Object.assign({
        ...state,
        users: {
          ...state.users,
          [payload.uid]: payload.data
        }
      }, payload.uid === (state.current && state.current.uid) && {
        current: {
          ...state.current,
          data: payload.data
        }
      });
    }

  case types.LIKE_PLOG:
    // Fix speculative updates
    return updateInCopy(state, ['current', 'data', 'likedPlogs', payload.plogID],
                                  payload.like);
   // return specUpdate(state, ['current', 'data', 'likedPlogs', payload.plogID],
   //                   payload.like);

  case types.LIKE_PLOG_ERROR:
    return revert(state, ['current', 'data', 'likedPlogs', payload.plogID]);

  case types.PLOG_LOGGED: {
    const plogData = plogStateToDoc(payload.plog);
    return updateInCopy(
      state, ['current', 'data'],
      data => ({
        ...(data || {}),
        stats: updateStats(data.stats, plogData),
        achievements: updateAchievements(data.achievements, plogData)
      })
    );
  }

    case types.LOCATION_CHANGED: {
      return {
        ...state,
        location: payload.location,
        locationInfo: payload.location ? state.locationInfo : null
      };
    }

  case types.LOCATION_INFO: {
    return {
      ...state,
      locationInfo: payload.locationInfo[0]
    };
  }

  case types.SIGNUP:
    return { ...state, signupError: null };

  case types.SIGNUP_ERROR:
    return { ...state, signupError: payload.error };

  case types.LOGIN_ERROR:
    return { ...state, loginError: payload.error };

    default: {
      return state;
    }
  }
};
