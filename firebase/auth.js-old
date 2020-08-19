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
    });

    const data = await doc.get();
};

export const onAuthStateChanged = auth.onAuthStateChanged.bind(auth);
