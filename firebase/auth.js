import * as Facebook from 'expo-facebook';

import { auth, firebase, storage, Users } from './init';
import firebaseConfig from './config';


/**
 * @param {firebase.User} [user]
 */
const initialUserData = user => ({
    homeBase: '',
    displayName: user && user.displayName || 'Unnamed Plogger',
    shareActivity: false,
    emailUpdatesEnabled: false,
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
async function initializeUserData(ref, user) {
    try {
        const r = await ref.get();
        if (r.exists) return;
    } catch (err) {
        console.warn('error getting user data', err);
    }

    await ref.set(initialUserData(user));
}

/**

 * @param {firebase.User} user
 */
export const getUserData = async (user) => {
    const ref = Users.doc(user.uid);

    await initializeUserData(ref, user);

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
    const ref = storage.ref().child(`userpublic/${auth.currentUser.uid}/plog/profile.jpg`);
    const response = await fetch(uri);
    await ref.put(await response.blob());
    Users.doc(auth.currentUser.uid).update({ profilePicture: await ref.getDownloadURL() });
};
