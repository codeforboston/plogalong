import * as types from "../actionTypes";

import { specUpdate, revert, updateInCopy } from '../../util/redux';
import { calculateBonusMinutes, updateAchievements, updateStats } from '../../firebase/project/functions/shared';
import { plogStateToDoc } from '../../firebase/plogs';


/**
 * @typedef {import('../../firebase/project/functions/shared').UserData} UserData
 */
/** @typedef {import('firebase').User} FirebaseUser */
/** @typedef {string} UserID */
/** @typedef {FirebaseUser & { data?: UserData }} User */

const initialState = {
  /** @type {User} */
  current: null,
  /** @type {{ [k in UserID]: User }} */
  users: {},
  location: null,
  locationInfo: null,
  /** @type {{ type: 'email' | 'google' | 'facebook' | 'anonymous', params: any }} */
  authenticating: null,
  signupError: null
};

/**
 * @param {typeof initialState} state
 *
 * @returns {typeof initialState}
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
          data: state.users[user.uid] || { notLoaded: true }
        } : null,
        authenticating: null
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
      data => {
        const { achievements, completed } = updateAchievements(data.achievements, plogData);

        return {
          ...(data || {}),
          stats: updateStats(data.stats, plogData, calculateBonusMinutes(completed)),
          achievements
        };
      }
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
    return { ...state, authenticating: payload, signupError: null };

  case types.SIGNUP_ERROR:
    return { ...state, authenticating: null, signupError: payload.error };

  case types.LOGIN_ERROR:
    return { ...state, authenticating: null, loginError: payload.error };

    default: {
      return state;
    }
  }
};
