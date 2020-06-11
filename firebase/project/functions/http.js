const functions = require('firebase-functions');

const app = require('./app');
const users = require('./users');

const { HttpsError } = functions.https;


const Users = app.firestore().collection('users');
const Plogs = app.firestore().collection('plogs');

/**
 * @typedef {object} LikeRequest
 * @property {string} plog
 * @property {boolean} like
 */

/**
 * @param {LikeRequest} data
 * @param {functions.https.CallableContext} context
 */
async function likePlog(data, context) {
  const {auth} = context;

  if (!auth || !auth.uid)
    throw new HttpsError('unauthenticated', 'Request not authenticated');

  if (!data.plog)
    throw new HttpsError('failed-precondition', 'Missing required parameter: plog');

  const plogRef = Plogs.doc(data.plog);
  const userRef = Users.doc(auth.uid);

  return await app.firestore().runTransaction(async trans => {
    const [userSnap, plogSnap] = await trans.getAll(userRef, plogRef);

    if (!userSnap.exists)
      throw new HttpsError('not-found', 'User data has not been correctly initialized');
    if (!plogSnap.exists)
      throw new HttpsError('not-found', 'Invalid plog id');

    const likedPlogs = userSnap.data().likedPlogs || {};
    let likeCount = plogSnap.data().d.likeCount || 0;

    if (data.like && !likedPlogs[data.plog]) {
      likedPlogs[data.plog] = Date.now();
      ++likeCount;
    } else if (!data.like && likedPlogs[data.plog]) {
      delete likedPlogs[data.plog];
      --likeCount;
    } else {
      // Nothing changed
      return { likeCount };
    }

    trans.update(plogRef, { 'd.likeCount': Math.max(likeCount, 0) })
      .update(userRef, { likedPlogs });

    return { likeCount };
  });
}

/**
 * @typedef {object} ProfileRequest
 * @property {string} userID
 */

/**
 * @param {ProfileRequest} data
 * @param {functions.https.CallableContext} context
 */
async function loadUserProfile(data, context) {
  if (!context.auth || !context.auth.uid)
    throw new HttpsError('unauthenticated', 'Request not authenticated');

  if (!data.userID)
    throw new HttpsError('failed-precondition', 'Missing required parameter: userID');

  const [user, userData] = await Promise.all([
    app.auth().getUser(data.userID),
    Users.doc(data.userID).get()
  ]);

  if (!userData.exists)
    throw new HttpsError('not-found', 'Invalid user id');

  const {privateProfile, displayName, profilePicture, achievements = {}, stats = {}} = userData.data();

  if (privateProfile)
    throw new HttpsError('permission-denied', 'That profile is private');

  return {
    last: user.metadata.lastSignInTime,
    created: user.metadata.creationTime,
    plogCount: stats && stats.total && stats.total.count || 0,
    displayName,
    achievements,
    profilePicture,
  };
}

/**
 * @typedef {object} MergeAccountRequest
 * @property {string} userID uid of the anonymous user to merge into this account
 * @property {string} merge
 */

const matchKeys = (a, match) => {
  for (const k of Object.keys(match))
    if (a[k] !== match[k])
      return false;

  return true;
};

/**
 * Called by an authorized user to merge in the plogs from another user. If the
 * merge succeeds, the other user is then deleted.
 *
 * @param {MergeAccountRequest} data
 * @param {functions.https.CallableContext} context
 */
async function mergeWithAccount(data, context) {
  if (!context.auth || !context.auth.uid)
    throw new HttpsError('unauthenticated', 'Request not authenticated');

  if (!data.userID)
    throw new HttpsError('failed-precondition', 'Missing required parameter: userID');

  const [user, otherUserData] = await Promise.all([
    app.auth().getUser(context.auth.uid),
    Users.doc(data.userID).get()
  ]);

  {
    const { allowMergeWith } = otherUserData && otherUserData.data() || {};
    const { providerId, ...match } = allowMergeWith;
    const provider = user.providerData.find(p => p.providerId === providerId);
    if (!provider || !matchKeys(provider, match))
      throw new HttpsError('permission-denied', 'Permission denied');
  }

  await users.mergeUsers(data.userID, context.auth.uid);

  await app.auth().deleteUser(data.userID);
  await Users.doc(data.userID).delete();

  return {};
}

module.exports = {
  likePlog,
  loadUserProfile,
  mergeWithAccount,
};
