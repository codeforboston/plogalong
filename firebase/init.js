import * as firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/functions';
import 'firebase/auth';

import config from '../config';
const { firebase: firebaseConfig } = config;

import { GeoFirestore } from 'geofirestore';

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
export const geofirestore = new GeoFirestore(firestore);
export default geofirestore;

export const auth = firebase.auth();

export { firebase };

export const storage = firebase.storage();
export const functions = firebase.functions();

export const Users = firestore.collection('users');
export const Plogs = geofirestore.collection('plogs');
export const Plogs_ = firestore.collection('plogs');
export const Comments = firestore.collection('comments');
export const Regions = firestore.collection('regions');
