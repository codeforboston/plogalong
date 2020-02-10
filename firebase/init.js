import * as firebase from 'firebase';
import firebaseConfig from './config';
import 'firebase/firestore';
import 'firebase/auth';

if (
  !(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.databaseURL &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  )
) {
  throw new Error("Missing Firestore config parameters; update your configuration");
}

firebase.initializeApp(firebaseConfig);

export const firestore = firebase.firestore();

export const auth = firebase.auth();

export { firebase };

export const storage = firebase.storage();

export const Users = firestore.collection('users');
