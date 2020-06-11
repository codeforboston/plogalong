import firebaseConfig from './firebase/config.js';
import * as config from './config.json';
import Constants from 'expo-constants';


export default Object.assign(
  {
    appDomain: "app.plogalong.com",
    url: "https://www.plogalong.com"
  },
  config,
  !config.firebase && { firebase: firebaseConfig },
  Constants.manifest.extra,
);
