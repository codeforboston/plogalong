import { AsyncStorage } from 'react-native';
import { LOG_PLOG, UPDATE_PLOGS, SET_CURRENT_USER, SET_PREFERENCES} from './actionTypes';
import * as types from './actionTypes';
import { auth, firebase } from '../firebase/init';


/**
 * @typedef {Object} PlogInfo
 * @property {Location} location
 * @property {}
 */
export const logPlog = (plogInfo) => ({
    type: LOG_PLOG,
    payload: plogInfo
});

export const updatePlogs = (plogs) => ({
    type: UPDATE_PLOGS,
    payload: {
        plogs,
    },
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
            dispatch({ type: types.LOGIN_ERROR,
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

export const loginAnonymously = () => (
    async dispatch => {
        try {
            await auth.signInAnonymously();
        } catch(err) {

        }
    }
);

export const logout = () => (
    async _ => {
        await auth.signOut();
    }
);


export default {
    logPlog,
    updatePlogs,
    setCurrentUser,
};
