import * as Facebook from 'expo-facebook';

import { auth, firebase, Users } from './init';
import firebaseConfig from './config';


const initialUserData = () => ({
    homeBase: '',
    username: 'Unnamed Plogger',
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
 */
async function initializeUserData(ref) {
    try {
        const r = await ref.get();
        if (r.exists) return;
    } catch (err) {
        console.warn('error getting user data', err);
    }

    await ref.set(initialUserData());
}

/**

 * @param {firebase.User|firebase.User["uid"]} user
 */
export const getUserData = async (user) => {
    const ref = Users.doc(typeof user === 'string' ? user : user.uid);

    await initializeUserData(ref);

    return ref;
};

const profileFields = ['displayName', 'photoURL'];
export const setUserData = async (data) => {
    if (!auth.currentUser)
        return;

    const updateFields = profileFields.reduce((m, field) => {
        if (!data[field])
            return m;

        const val = data[field];
        delete data[field];
        return m ? Object.assign(m, { [field]: val }) : { [field]: val };
    }, null);

    if (updateFields) {
        await auth.currentUser.updateProfile(updateFields);
        authStateChangedCallback(auth.currentUser);
    }

    Users.doc(auth.currentUser.uid).update(data);
};
