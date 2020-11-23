import { SET_CURRENT_USER, SET_PREFERENCES } from './actionTypes';
import * as types from './actionTypes';
import { auth, firebase } from '../firebase/init';
import { deletePlog as _deletePlog, savePlog } from '../firebase/plogs';
import * as L from '../firebase/auth';
import * as functions from '../firebase/functions';

/** @typedef {import('redux').Action} Action */

const _action = (fn, {pre, err, post, cancel}={}) => (
  (...args) => (
    async dispatch => {
      if (pre)
        dispatch(typeof pre === 'function' ? pre(...args) : pre);

      try {
        const result = await fn(...args);

        if (!result && cancel) {
          dispatch(typeof cancel === 'function' ? cancel(...args) : cancel);
        } else if (post)
          dispatch(typeof post === 'function' ? post(result) : post);
      } catch (e) {
        if (err) dispatch(err(e));
      }
    }
  )
);

export const authCancelled = _ => ({
  type: types.AUTH_CANCELED
});

export const loginError = error => ({
  type: types.LOGIN_ERROR,
  payload: { error: error && error.code === 'auth/user-canceled' ? null : error }
});

export const signupError = (error) => ({
  type: types.SIGNUP_ERROR,
  payload: { error }
});

export const uploadProgress = (uri, progress) => ({
  type: types.UPLOAD_PROGRESS,
  payload: { progress, uri }
});

export const uploadError = (error, uri) => ({
  type: types.UPLOAD_ERROR,
  payload: { error, uri }
});

export const plogDeleted = (plogID) => ({
  type: types.PLOG_DELETED,
  payload: { plogID }
});

export const logPlog = (plogInfo) => (
  async dispatch => {
    dispatch({ type: types.LOG_PLOG, payload: { plog: plogInfo }});
    try {
      const plogID = await savePlog(plogInfo, {
        uploadError(error, uri) {
          dispatch(uploadError(error, uri));
        },
        uploadProgress(uri, { bytesTransferred, totalBytes }) {
          dispatch(uploadProgress(uri, totalBytes ? bytesTransferred/totalBytes : 0));
        }
      });
      plogInfo.id = plogID;
      dispatch({ type: types.PLOG_LOGGED,
                 payload: { plog: plogInfo, plogID } });
    } catch (error) {
      dispatch({ type: types.LOG_PLOG_ERROR, payload: { error } });
    }
  });

/**
 * @param {{ id: string, userID: string, public: boolean}} plogInfo
 */
export const deletePlog = plogInfo => (
  async dispatch => {
    dispatch({ type: types.DELETE_PLOG, payload: plogInfo });
    try {
      await _deletePlog(plogInfo);
      dispatch(plogDeleted(plogInfo.id));
    } catch (error) {
      dispatch({ type: types.DELETE_PLOG_ERROR, payload: { error } });
    }
  });

export const reportPlog = plogID => (
  async dispatch => {
    dispatch({
      type: types.REPORT_PLOG,
      payload: { plogID }
    });
    try {
      await functions.reportPlog(plogID);
      dispatch(flashMessage(
        'Thanks for reporting'
      ));
    } catch (error) {
      dispatch({
        type: types.REPORT_PLOG_ERROR,
        payload: { plogID, error }
      });
    }
  });

export const loadHistory = (userID, replace=true) => (
  (dispatch, getState) => {
    const { log } = getState();
    if (!log.historyLoading)
      dispatch({
        type: types.LOAD_HISTORY,
        payload: { userID, replace }
      });
  });

export const loadLocalHistory = () => ({
  type: types.LOAD_LOCAL_HISTORY,
  payload: { }
});

export const loadPlogs = plogIDs => ({
  type: types.LOAD_PLOGS,
  payload: { plogIDs }
});

export const unloadPlogs = plogIDs => ({
  type: types.UNLOAD_PLOGS,
  payload: { plogIDs }
});

export const gotPlogData = plogs => ({
  type: types.PLOG_DATA,
  payload: { plogs }
});

export const _plogsUpdated = (listType, plogs, idList, {prepend=false, append=false, removed}={}) => ({
  type: types.PLOGS_UPDATED,
  payload: {
    listType,
    plogs,
    idList,
    disposition: prepend ? 'prepend' : append ? 'append' : 'replace',
    removed: removed || []
  },
});

export const plogsUpdated = (...args) => _plogsUpdated('history', ...args);

export const localPlogsUpdated = (...args) => _plogsUpdated('localPlogs', ...args);

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

export const setRegion = region => ({
  type: types.SET_REGION,
  payload: { region }
});

export const localPlogIDs = plogIDs => ({
  type: types.LOCAL_PLOG_IDS,
  payload: { plogIDs }
});

export const setCurrentUser = (user) => ({
    type: SET_CURRENT_USER,
    payload: {
        user,
    },
});

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

export const loginWithEmail = _action(auth.signInWithEmailAndPassword.bind(auth), {
  pre: signup('email'),
  err: loginError
});

export const loginWithGoogle = _action(L.loginWithGoogle, {
  pre: signup('google', {}),
  cancel: authCancelled,
  err: loginError
});

export const linkToGoogle = _action(L.linkToGoogle, {
  pre: signup('google', {}),
  cancel: authCancelled,
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

export const loginWithApple = _action(L.loginWithApple, {
  pre: signup('apple', {}),
  cancel: authCancelled,
  err: signupError
});

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

export const flashMessage = (message, options=null) => ({
  type: types.FLASH,
  payload: { text: message, stamp: Date.now(), options }
});

export const pauseFlashMessages = () => ({
  type: types.PAUSE_MESSAGES,
  payload: { paused: true }
});

export const unpauseFlashMessages = () => ({
  type: types.PAUSE_MESSAGES,
  payload: { paused: false }
});

export const verifyEmail = oobCode => (
  async dispatch => {
    try {
      await auth.applyActionCode(oobCode);
      dispatch({ type: types.USER_EMAIL_CONFIRMED });
    } catch (error) {
      dispatch({ type: types.ACTION_CODE_ERROR, payload: { error, oobCode } });
    }
  }
);

export default {
    logPlog,
    plogsUpdated,
    setCurrentUser,
};
