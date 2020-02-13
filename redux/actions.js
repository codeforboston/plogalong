import { AsyncStorage } from 'react-native';
import * as Google from 'expo-google-app-auth';

import { SET_CURRENT_USER, SET_PREFERENCES} from './actionTypes';
import * as types from './actionTypes';
import { auth, firebase } from '../firebase/init';
import { savePlog } from '../firebase/plogs';

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

const signupError = (err) => ({
    type: types.SIGNUP_ERROR,
    payload: {
        error: {
            code: err.code,
            message: err.message
        }
    }
});

export const logPlog = (plogInfo) => (
    async dispatch => {
        await savePlog(plogInfo);
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

export const signupWithEmail = (email, password) => (
    async dispatch => {
        try {
            await auth.createUserWithEmailAndPassword(email, password);
        } catch(err) {
            dispatch({ type: types.SIGNUP_ERROR,
                       payload: {
                           error: {
                               code: err.code,
                               message: err.message
                           }
                       }
                     });
        }
    }
);

export const linkToEmail = (email, password) => (
    async dispatch => {
        try {
            const credential = firebase.auth.EmailAuthProvider.credential(email, password);
            const creds = await auth.currentUser.linkWithCredential(credential);
            dispatch(setCurrentUser(creds.user.toJSON()));
        } catch(err) {
            dispatch({ type: types.SIGNUP_ERROR,
                       payload: {
                           error: {
                               code: err.code,
                               message: err.message
                           }
                       }
                     });
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
            console.warn(signupError(err));
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


export default {
    logPlog,
    plogsUpdated,
    setCurrentUser,
};
