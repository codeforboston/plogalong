import firebaseConfig from './firebase/config.js';
import * as config from './config.json';
import Constants from 'expo-constants';


export default Object.assign(
  {
    appDomain: "app.plogalong.com",
    url: "https://www.plogalong.com",
    termsURL: "https://app.termly.io/document/terms-of-use-for-ios-app/a3df3866-e2e8-4a51-8ac1-a4b41efe140b",
    disclaimerURL: "https://app.termly.io/document/disclaimer/e6911739-21db-4678-84a0-68ffc4b597b1",
  },
  config,
  !config.firebase && { firebase: firebaseConfig },
  Constants.manifest.extra,
);
