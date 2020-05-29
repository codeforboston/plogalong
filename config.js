import firebaseConfig from './firebase/config.js';
import * as config from './config.json';
import Constants from 'expo-constants';

export const firebase = Constants.manifest.extra.firebase || firebaseConfig;

export default {
    ...config,
    firebase
};
