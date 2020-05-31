import * as Facebook from 'expo-facebook';
import * as Google from 'expo-google-app-auth';
// import * as AppleAuthentication from 'expo-apple-authentication';

import config from '../config';
const { firebase: firebaseConfig } = config;

import { auth, firebase, Users } from './init';
import { uploadImage } from './util';
import * as functions from './functions';


/**
 * @param {firebase.User} [user]
 */
const initialUserData = (user, locationInfo) => ({
  homeBase: locationInfo ? `${locationInfo.city}, ${locationInfo.region}` : '',
  displayName: user && user.displayName || 'Mysterious Plogger',
  shareActivity: false,
  emailUpdatesEnabled: false,
  privateProfile: false,
});


/**
 * @template P
 * @typedef { P extends PromiseLike<infer U> ? U : P } Unwrapped
 */

/**
 * @template LoginFn
 * @param {LoginFn} loginFn
 * @template {(credentials: Unwrapped<ReturnType<LoginFn>>) => any} CredFn
 * @param {CredFn} credFn
 *
 * @returns {<T>(fn: (result: ReturnType<CredFn>) => Promise<T>, canceledFn: () => any) => T?}
 */
const withCredentialFn = (loginFn, credFn) => (
  (fn, canceledFn=null) => (
    async () => {
      const result = await loginFn();

      if (result.type === 'success') {
        return await fn(credFn(result));
      }

      if (canceledFn) canceledFn();

      return null;
    }
  )
);

const withFBCredential = withCredentialFn(
  () => Facebook.logInWithReadPermissionsAsync(
    firebaseConfig.auth.facebook.appId,
    { permissions: ['public_profile'] }
  ),

  (c) => firebase.auth.FacebookAuthProvider.credential(c.token)
);


const withGoogleCredential = withCredentialFn(
  () => Google.logInAsync(firebaseConfig.auth.google),
  c => firebase.auth.GoogleAuthProvider.credential(c.idToken, c.accessToken)
);

const withAppleCredential = (fn) => (
  async () => {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.EMAIL
      ]
    });
  }
);

const signInWithCredential = auth.signInWithCredential.bind(auth);

/** @type {() => Promise<firebase.auth.UserCredential>} */
export const loginWithFacebook = withFBCredential(signInWithCredential);
/** @type {() => Promise<firebase.auth.UserCredential>} */
export const linkToFacebook = withFBCredential(cred => auth.currentUser.linkWithCredential(cred));

export const unlinkFacebook = () => {
  auth.currentUser.unlink('facebook.com');
};

/** @type {() => Promise<firebase.auth.UserCredential>} */
export const loginWithGoogle = withGoogleCredential(signInWithCredential);
/** @type {() => Promise<firebase.auth.UserCredential>} */
export const linkToGoogle = withGoogleCredential(cred => auth.currentUser.linkWithCredential(cred));

export const loginWithEmail = auth.signInWithEmailAndPassword.bind(auth);

export const linkToEmail = (email, password) => {
  const credential = firebase.auth.EmailAuthProvider.credential(email, password);
  return auth.currentUser.linkWithCredential(credential);
};

export const unlinkGoogle = () => {
  auth.currentUser.unlink('google.com');
};

export const logOut = async () => {
  return auth.signOut();
}

let unsubscribeAuthStateChange;;
export function onAuthStateChanged(callback) {
  if (unsubscribeAuthStateChange)
    unsubscribeAuthStateChange();

  unsubscribeAuthStateChange = auth.onAuthStateChanged(callback);
  return unsubscribeAuthStateChange;
}

/**
 * @param {firebase.firestore.DocumentReference} ref
 * @param {firebase.User} user
 */
async function initializeUserData(ref, user, store) {
  try {
    const r = await ref.get();
    if (r.exists) return;
  } catch (err) {
    console.warn('error getting user data', err);
  }

  // XXX Could easily get raced!
  const {locationInfo} = store.getState().users;
  await ref.set(initialUserData(user, locationInfo));
}

/**

 * @param {firebase.User} user
 */
export const getUserData = async (user, store) => {
  const ref = Users.doc(user.uid);

  await initializeUserData(ref, user, store);

  return ref;
};

export const setUserData = async (data) => {
  if (!auth.currentUser)
    return;

  const {profilePicture} = data;
  if (profilePicture && typeof profilePicture !== 'string') {
    delete data['profilePicture'];
  }

  Users.doc(auth.currentUser.uid).update(data).catch(x => {
    console.warn('error updating user', auth.currentUser, data, x);
  });

  if (profilePicture && profilePicture.uri) {
    setUserPhoto(profilePicture);
  }
};

export const setUserPhoto = async ({uri}) => {
  Users.doc(auth.currentUser.uid).update({
    profilePicture: await uploadImage(uri, `userpublic/${auth.currentUser.uid}/plog/profile.jpg`, { resize: { width: 300, height: 300 }})
  });
};

/**
 * Called as an anonymous user (A) with the uid of another user (B) to "merge" A
 * into B. The current session will be reauthenticated as B using `credentials`,
 * A's plogs will be moved over to B, and A will be deleted.
 *
 * @param {firebase.auth.AuthCredential} credential used to switch the current user
 * @param {any} match
 */
export const mergeAnonymousAccount = async (credential, match) => {
  if (!auth.currentUser || !auth.currentUser.isAnonymous)
    throw new Error('Must be logged in as an anonymous user');

  const anonUID = auth.currentUser.uid;
  await setUserData({ allowMergeWith: { providerId: credential.providerId, ...match  } });
  await auth.signInWithCredential(credential);
  await functions.mergeWithAccount(anonUID);
};
