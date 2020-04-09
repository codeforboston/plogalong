import { AsyncStorage } from 'react-native';

import { SET_CURRENT_USER, SET_PREFERENCES} from './actionTypes';
import * as types from './actionTypes';
import { auth, firebase } from '../firebase/init';
import { savePlog } from '../firebase/plogs';
import * as L from '../firebase/auth';
import * as functions from '../firebase/functions';


const _action = (fn, {pre, err, post}={}) => (
  (...args) => (
    async dispatch => {
      if (pre)
        dispatch(typeof pre === 'function' ? pre(...args) : pre);

      try {
        const result = await fn(...args);
        if (post) dispatch(typeof post === 'function' ? post(result) : post);
      } catch (e) {
        if (err) dispatch(err(e));
        console.error(e);
      }
    }
  )
);

const loginError = (err) => ({
    type: types.LOGIN_ERROR,
    payload: {
        error: {
            code: err.code,
            message: err.message
        }
    }
});

export const signupError = (error) => ({
    type: types.SIGNUP_ERROR,
    payload: { error }
});

export const logPlog = (plogInfo) => (
  async dispatch => {
    dispatch({ type: types.LOG_PLOG, payload: { plog: plogInfo }});
    try {
      await savePlog(plogInfo);
      dispatch({ type: types.PLOG_LOGGED, payload: { plog: plogInfo } });
    } catch (error) {
      dispatch({ type: types.LOG_PLOG_ERROR, error });
    }
  });

export const loadHistory = (userID, replace=true) => ({
  type: types.LOAD_HISTORY,
  payload: { userID, replace }
});

export const plogsUpdated = (plogs, {prepend=false, replace=false}={}) => ({
  type: types.PLOGS_UPDATED,
  payload: {
    plogs,
    prepend,
    replace
  },
});

export const plogUpdated = plog => ({
    type: types.PLOG_UPDATED,
    payload: plog
});

export const likePlog = (plogID, like) => (
  async dispatch => {
    try {
      dispatch({
        type: types.LIKE_PLOG,
        payload: { plogID, like }
      });
      await functions.likePlog(plogID, like);
    } catch(error) {
      dispatch({
        type: types.LIKE_PLOG_ERROR,
        payload: { plogID, like, error }
      });
    }
  }
);

export const localPlogsUpdated = (plogs, {prepend=false, replace=false}={}) => ({
  type: types.LOCAL_PLOGS_UPDATED,
  payload: {
    plogs,
    prepend,
    replace
  }
});

export const setCurrentUser = (user) => ({
    type: SET_CURRENT_USER,
    payload: {
        user,
    },
});

export function loadPreferences() {
    return async dispatch => {
        const prefs = await AsyncStorage.getItem('com.plogalong.preferences');

        dispatch(setPreferences(prefs ? JSON.parse(prefs) : {}));
    };
}

export const setPreferences = (preferences) => ({
    type: SET_PREFERENCES,
    payload: {
        preferences,
    }
});

/** @param {'email'|'google'|'facebook'|'anonymous'} type */
const signup = (type, params) => ({ type: types.SIGNUP, payload: { type, params }});

export const signupWithEmail = (email, password) => (
    async dispatch => {
        try {
          dispatch(signup('email', { email, password }));
            await auth.createUserWithEmailAndPassword(email, password);
        } catch(error) {
          dispatch(signupError(err));
        }
    }
);

export const linkToEmail = (email, password) => (
    async dispatch => {
      dispatch(signup('email', { email, password }));
        try {
            const credential = firebase.auth.EmailAuthProvider.credential(email, password);
            const creds = await auth.currentUser.linkWithCredential(credential);
            dispatch(setCurrentUser(creds.user.toJSON()));
        } catch(err) {
          dispatch(signupError(err));
        }
    }
);


export const loginWithEmail = _action(auth.signInWithEmailAndPassword.bind(auth), {
  pre: signup('email'),
  err: loginError
});

export const loginWithGoogle = _action(L.loginWithGoogle, {
  pre: signup('google', {}),
  err: loginError
});

export const linkToGoogle = _action(L.linkToGoogle, {
  pre: signup('google', {}),
  err: signupError
});

export const unlinkGoogle = _action(L.unlinkGoogle, { err: signupError });

export const loginWithFacebook = _action(L.loginWithFacebook, {
  pre: signup('facebook', {}),
  err: signupError
});

export const linkToFacebook = _action(L.linkToFacebook, {
  pre: signup('facebook', {}),
  err: signupError
});

export const unlinkFacebook = _action(L.unlinkFacebook, { err: signupError });


export const loginAnonymously = _action(() => auth.signInAnonymously(), {
  pre: (autoLogin=false) => signup('anonymous', { autoLogin }),
  err: signupError
});

export const gotUserData = (uid, data) => ({ type: types.USER_DATA, payload: { uid, data }});

export const setUserData = (data) => (
    async dispatch => {

    }
);

export const logout = () => (
    async _ => {
        await auth.signOut();
    }
);

export const setUserField = (field, value) => (
    async _ => {
        // await auth.setU
    }
);

export const startWatchingLocation = () => ({ type: types.START_LOCATION_WATCH });
export const stopWatchingLocation = () => ({ type: types.STOP_LOCATION_WATCH });

export const locationChanged = location => ({
    type: types.LOCATION_CHANGED,
    payload: { location }
});

export const locationError = error => ({
  type: types.LOCATION_ERROR,
  payload: { error }
});

export const gotLocationInfo = locationInfo => ({
  type: types.LOCATION_INFO,
  payload: { locationInfo }
});


export default {
    logPlog,
    plogsUpdated,
    setCurrentUser,
};
