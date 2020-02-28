const functions = require('firebase-functions');
const app = require('./app');

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

  console.log(data, auth.uid);

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

module.exports = {
  likePlog
};
