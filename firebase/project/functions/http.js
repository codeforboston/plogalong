const functions = require('firebase-functions');
const crypto = require('crypto');

const app = require('./app');
const email = require('./email');
const regions = require('./regions');
const users = require('./users');
const $u = require('./util.js');

const { HttpsError } = functions.https;

const { Users, Plogs, Regions } = require('./collections');

function sha256(input, enc='utf8') {
  const hash = crypto.createHash('sha256');
  hash.update(input);
  return hash.digest(enc);
}

/**
 * @template P
 * @typedef { P extends PromiseLike<infer U> ? U : P } Unwrapped
 */
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
    let likeCount = plogSnap.data().likeCount || 0;

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

    trans.update(plogRef, { 'likeCount': Math.max(likeCount, 0) })
      .update(userRef, { likedPlogs });

    return { likeCount };
  });
}

/**
 * Intended to be called by the client after the user links their Plogalong
 * account to an auth provider.
 *
 * @param {functions.https.CallableContext} context
 */
async function userLinked(_, context) {
  if (!context.auth || !context.auth.uid)
    throw new HttpsError('unauthenticated', 'Request not authenticated');

  const result = await app.firestore().runTransaction(async t => {
    const dataDoc = Users.doc(context.auth.uid);
    const [user, userData] = await Promise.all([
      app.auth().getUser(context.auth.uid),
      /** @type {Promise<firebase.firestore.DocumentSnapshot>} */ (t.get(dataDoc))
    ]);

    if (!user.providerData.length || !userData.exists)
      return null;

    const providers = user.providerData.map(pd => pd.providerId).join(',');
    const changes = { providers };
    const data = userData.data();

    if (!data.displayName)
      data.displayName = user.displayName;

    // const regionIDs = await regions.updateLeaderboardsForUser(user.uid, data.stats, t);
    t.update(dataDoc, changes);
    return regionIDs;
  });

  if (!result)
    throw new HttpsError('permission-denied', 'Can only be called by a user with a linked credential');

  return { regionIDs: result };
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

  const {privateProfile, displayName, profilePicture, achievements, stats} = userData.data();

  if (achievements) {
    for (const k of Object.keys(achievements)) {
      if (!achievements[k] || !achievements[k].completed)
        delete achievements[k];
    }
  }

  if (privateProfile)
    throw new HttpsError('permission-denied', 'That profile is private');

  return {
    last: stats && stats.latest ? stats.latest.dateTime.toDate().toISOString() : user.metadata.lastSignInTime,
    created: user.metadata.creationTime,
    plogCount: stats && stats.total && stats.total.count || 0,
    displayName,
    achievements: achievements || null,
    profilePicture,
    anonymous: !(user.emailVerified || user.providerData.length)
  };
}

/**
 * @typedef {object} MergeAccountRequest
 * @property {string} userID
 * @property {string} merge
 * @property {boolean} [skipPlogMerge]
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

  let { skipPlogMerge } = data;
  {
    const { allowMergeWith, stats } = otherUserData && otherUserData.data() || {};
    const { providerId, ...match } = allowMergeWith;
    const provider = user.providerData.find(p => p.providerId === providerId);
    if (!provider || !matchKeys(provider, match))
      throw new HttpsError('permission-denied', 'Permission denied');

    if (!stats || !stats.total || !stats.total.count)
      skipPlogMerge = true;
  }

  if (!skipPlogMerge)
    await users.mergeUsers(context.auth.uid, data.userID);

  await app.auth().deleteUser(data.userID);
  await Users.doc(data.userID).delete();

  return {};
}

/**
 * @typedef {Object} ReportPlogRequest
 * @property {string} plogID
 */

/**
 * Called by an authorized user to merge in the plogs from another user. If the
 * merge succeeds, the other user is then deleted.
 *
 * @param {ReportPlogRequest} data
 * @param {functions.https.CallableContext} context
 */
async function reportPlog(data, context) {
  const user = context.auth && context.auth.uid && await app.auth().getUser(context.auth.uid);

  if (!user)
    throw new HttpsError('unauthenticated', 'Request not authenticated');
  if (!user.emailVerified)
    throw new HttpsError('permission-denied', 'You must have a verified account before reporting plogs');

  const { admin_email } = functions.config().plogalong || {};
  const { plogID } = data;

  const plog = await Plogs.doc(plogID).get();
  const plogData = plog.exists && plog.data();

  if (!plogData || !plogData.Public)
    throw new HttpsError('not-found', 'No such plog');

  const flaggers = plogData._Flaggers || [];
  const hashedUID = sha256(user.uid);

  if (flaggers && flaggers.includes(hashedUID))
    return;

  flaggers.push(hashedUID);
  await plog.ref.update({ '_Flaggers': flaggers });
  await email.send({
    recipients: admin_email,
    subject: `Plog flagged`,
    textContent: `${user.displayName} flagged a plog:`,
    htmlContent: `
<p>
  <strong>Flagged By:</strong> ${user.displayName} (ID: ${user.uid})
</p>
<p>
  <strong>Plog ID:</strong> ${plogID}
</p>
<p>
  <strong>Plogger:</strong> ${plogData.UserDisplayName}
</p>
<p>
  <strong>Flagged by:</strong> ${user.displayName}${flaggers.length > 1 ? ` and ${flaggers.length-1} other(s)` : ''}
</p>
<p>
  <strong>Photos:</strong> ${plogData.Photos.join(', ')}
</p>
`
  }).catch(err => {
    console.error('Error while sending mail:', err);
  });
}

/**
 * @param {{ latitude: number, longitude: number }} data
 * @param {functions.https.CallableContext} context
 */
async function getRegionInfo(data, context) {
  if (!context.auth || !context.auth.uid)
    throw new HttpsError('unauthenticated', 'Request not authenticated');

  if (typeof data.latitude !== "number" || typeof data.longitude !== "number")
    throw new HttpsError('failed-precondition', 'Request body must have a valid latitude and longitude');

  return await $u.regionInfo(data);
}

/**
 * @param {{ regionID: string, limit?: number }} data
 * @param {functions.https.CallableContext} context
 */
async function getRegionLeaders(data, context) {
  if (!context.auth || !context.auth.uid)
    throw new HttpsError('unauthenticated', 'Request not authenticated');

  if (!data.regionID)
    throw new HttpsError('failed-precondition', 'Missing required parameter: regionID');

  const region = await Regions.doc(data.regionID).get();

  if (!region.exists)
    throw new HttpsError('not-found', 'Invalid region id');

  const { county } = region.data();

  if (!county)
    throw new HttpsError('not-found', 'Invalid region id');

  const max = Math.min(data.limit || 20, 30);
  const users = await regions.getLeaders(data.regionID, max);

  const leaders = users.map(user => {
    const { displayName, profilePicture, id, stats } = user;
    const { count: regionCount, milliseconds: regionMilliseconds } = stats.total.region[data.regionID];

    return {
      id,
      regionCount,
      regionMilliseconds,
      profilePicture,
      displayName,
    };
  });

  return {
    region: $u.regionInfoForDoc(region),
    leaders
  };
}

/**
 * @param {{ type: string, payload: any }} data
 * @param {functions.https.CallableContext} context
 */
async function httpEndpoint(data, context) {
  switch (data.type) {
    case 'likePlog':
      return await likePlog(data.payload, context);
    case 'loadUserProfile':
      return await loadUserProfile(data.payload, context);
    case 'mergeWithAccount':
      return await mergeWithAccount(data.payload, context);
    case 'reportPlog':
      return await reportPlog(data.payload, context);
    case 'getRegionInfo':
      return await getRegionInfo(data.payload, context);
    case 'getRegionLeaders':
      return await getRegionLeaders(data.payload, context);
    case 'userLinked':
      return await userLinked(data.payload, context);
  }
  return {};
}

/** @typedef {Unwrapped<ReturnType<typeof getRegionInfo>>} RegionInfo */
/** @typedef {Unwrapped<ReturnType<typeof getRegionLeaders>>} RegionLeaderboard */
/** @typedef {Unwrapped<ReturnType<typeof loadUserProfile>>} UserProfile */

module.exports = {
  likePlog,
  loadUserProfile,
  mergeWithAccount,
  reportPlog,
  getRegionInfo,
  getRegionLeaders,
  userLinked,

  httpEndpoint
};
