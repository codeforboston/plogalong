import { AsyncStorage } from 'react-native';

import { setPreferences } from './actions';
import { SET_PREFERENCES, SET_CURRENT_USER } from './actionTypes';


/** @type {import('redux').Middleware} */
export default store => next => action => {
  const result = next(action);
  const prefs = store.getState().preferences;

  if (action.type === SET_PREFERENCES) {
    AsyncStorage.setItem("com.plogalong.preferences", JSON.stringify(prefs));
  } else if (action.type === SET_CURRENT_USER && action.payload.user) {
    store.dispatch(setPreferences({
      lastLogin: Date.now(),
      loginCount: (prefs.loginCount || 0) + 1,
      lastUID: action.payload.user.uid
    }));
  }

  return result;
};
