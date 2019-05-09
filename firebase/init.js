import * as firebase from 'firebase';
import firebaseConfig from './config';
import 'firebase/firestore';

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

export default firebase.firestore();
