import * as Facebook from 'expo-facebook';

import { auth, firebase, storage, Users } from './init';
import { uploadImage } from './util';
import firebaseConfig from './config';


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

export const loginWithFacebook = async () => {
  const { type, token } = await Facebook.logInWithReadPermissionsAsync(
    firebaseConfig.auth.facebook.appId,
    { permissions: ['public_profile'] }
  );

  if (type === 'success') {
    // Build Firebase credential with the Facebook access token.
    const credential = firebase.auth.FacebookAuthProvider.credential(token);

    // Sign in with credential from the Facebook user.
    return auth.signInWithCredential(credential);
  }
}

export const logOut = async () => {
  return auth.signOut();
}

let authStateChangedCallback;
export function onAuthStateChanged(callback) {
  authStateChangedCallback = callback;

  return auth.onAuthStateChanged(callback);
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
