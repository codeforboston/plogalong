import * as Facebook from 'expo-facebook';

import db, { auth, firebase } from './init';
import firebaseConfig from './config';

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

export const saveUser = async (user) => {
    const doc = db.collection('users').doc(user.uid);
    const result = await doc.set({
        UserID: user.uid,
        LastLogin: new Date(),
    }, { merge: true });

    return await doc.get();
};

let authStateChangedCallback;
export function onAuthStateChanged(callback) {
    authStateChangedCallback = callback;

    return auth.onAuthStateChanged(callback);
}

/**

 * @param {firebase.User|firebase.User["uid"]} user
 */
export const getUserData = (user) => db.collection('users').doc(typeof user === 'string' ? user : user.uid);

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

    db.collection('users').doc(auth.currentUser.uid).update(data);
};
