import { AsyncStorage } from 'react-native';
import * as Google from 'expo-google-app-auth';

import { SET_CURRENT_USER, SET_PREFERENCES} from './actionTypes';
import * as types from './actionTypes';
import { auth, firebase } from '../firebase/init';
import { savePlog } from '../firebase/plogs';
import * as functions from '../firebase/functions';

import firebaseConfig from '../firebase/config';
const { auth: { google: googleConfig } = {} } = firebaseConfig;


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

export const plogsUpdated = (plogs) => ({
    type: types.PLOGS_UPDATED,
    payload: {
        plogs,
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

export const localPlogsUpdated = plogs => ({
    type: types.LOCAL_PLOGS_UPDATED,
    payload: { plogs }
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

/** @param {'email'|'google'|'facebook'} type */
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
      dispatch(signup('google', { email, password }));
        try {
            const credential = firebase.auth.EmailAuthProvider.credential(email, password);
            const creds = await auth.currentUser.linkWithCredential(credential);
            dispatch(setCurrentUser(creds.user.toJSON()));
        } catch(err) {
          dispatch(signupError(err));
        }
    }
);

export const loginWithEmail = (email, password) => (
    async dispatch => {
        try {
            await auth.signInWithEmailAndPassword(email, password);
        } catch(err) {
            dispatch(loginError(err));
        }
    }
);

export const linkToGoogle = () => {
    if (!googleConfig)
        return signupError({ message: 'Google authentication has not been configured for this app' });

    return async dispatch => {
        try {
            const { type, accessToken, idToken } = await Google.logInAsync(googleConfig);

            if (type === 'success') {
                const credential = firebase.auth.GoogleAuthProvider.credential(idToken, accessToken);
                await auth.currentUser.linkWithCredential(credential);
            }
        } catch (err) {
            dispatch(signupError(err));
        }
    };
};

export const loginWithGoogle = () => {
    if (!googleConfig)
        return signupError({ message: 'Google authentication has not been configured for this app' });

    return async dispatch => {
        try {
            const { type, accessToken, idToken } = await Google.logInAsync(googleConfig);

            if (type === 'success') {
                const credential = firebase.auth.GoogleAuthProvider.credential(idToken, accessToken);
                await auth.signInWithCredential(credential);
            }
        } catch (err) {
            dispatch(loginError(err));
        }
    };
};
export const loginAnonymously = () => (
    async dispatch => {
        try {
            await auth.signInAnonymously();
        } catch(err) {

        }
    }
);

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

export const gotLocationInfo = locationInfo => ({
  type: types.LOCATION_INFO,
  payload: { locationInfo }
});

export default {
    logPlog,
    plogsUpdated,
    setCurrentUser,
};
