const app = require('./app');

/** @typedef {import('./shared').UserData} UserData */
/** @type {firebase.firestore.CollectionReference<UserData>} */
const Users = app.firestore().collection('users');

/** @typedef {import('./shared').PlogData} PlogData */
/** @type {firebase.firestore.CollectionReference<PlogData>} */
const Plogs = app.firestore().collection('plogs');

/** @typedef {import('./shared').RegionData} RegionData */
/** @type {firebase.firestore.CollectionReference<RegionData>} */
const Regions = app.firestore().collection('regions');

module.exports = {
  Plogs,
  Regions,
  Users
};
