import firebaseConfig from './firebase/config.js';
import * as config from './config.json';


export default {
    ...config,
    firebase: firebaseConfig
};
