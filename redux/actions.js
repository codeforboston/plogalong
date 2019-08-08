import { AsyncStorage } from 'react-native';
import { LOG_PLOG, UPDATE_PLOGS, SET_CURRENT_USER, SET_PREFERENCES} from './actionTypes';
import * as types from './actionTypes';
import { auth } from '../firebase/init';


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
            const user = await auth.createUserWithEmailAndPassword(email, password);
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
