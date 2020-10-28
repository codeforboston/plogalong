const app = require('./app');
const admin = require('firebase-admin');

const { mergeAchievements, mergeStats, updateLeaderboard } = require('./shared');
const { updatePlogsWhere, withBatch, withDocs, whereIn } = require('./util');

const { Plogs, Users, Regions } = require('./collections');
const { region } = require('firebase-functions');

/** @typedef {import('@google-cloud/storage').File} File */


/**
 * Move files from one user to another and update the associated plog documents
 *
 * @param {string} fromUserID
 * @param {string} toUserID
 */
async function migrateUserPlogs(fromUserID, toUserID, updates={}) {
  /** @type {{ [k in string]: File[] }} */
  const moved = {};
  const bucket = app.storage().bucket();

  for (const dir of ['userdata', 'userpublic']) {
    const prefix =  `${dir}/${fromUserID}/plog/`;
    /** @type {[File[]]} */
    const [files] = await bucket.getFiles({ prefix });

    const moveToPref = `${dir}/${toUserID}/plog/`;

    await Promise.all(files.map(async file => {
      try {
        const subpath = file.name.slice(prefix.length);
        if (!subpath.includes('/'))
          return;

        const destFile = bucket.file(moveToPref + subpath);
        const [plogID] = subpath.split('/');

        console.log('renaming', file.name, '->', destFile.name);
        await file.move(destFile);

        if (!moved[plogID])
          moved[plogID] = [];
        moved[plogID].push(destFile);
      } catch (er) {
        console.error(`Couldn't move ${file.name}:`, er);
        return;
      }
    }));
  }

  await withBatch(Plogs, ['UserID', '==', fromUserID], async (batch, plogDoc) => {
    batch.update(plogDoc, {
      Plogs: moved[plogDoc.id] ? await Promise.all(moved[plogDoc.id].map(file => file.getSignedUrl())) : [],
      ...updates
    });
  });
}

/**
 * Merge a user's plogs into
 */
async function mergeUsers(fromUserID, intoUserID) {
  const intoUserDoc = Users.doc(intoUserID);
  const { displayName, profilePicture, stats, achievements, likedPlogs } = await intoUserDoc.get().then(doc => doc.data());
  const updates = { 'UserID': intoUserID, };

  if (displayName)
    updates['UserDisplayName'] = displayName;
  if (profilePicture)
    updates['UserProfilePicture'] = profilePicture;

  await migrateUserPlogs(fromUserID, intoUserID);

  const fromUser = await Users.doc(fromUserID).get().then(u => u.data());
  const updatedStats = mergeStats(fromUser.stats, stats);
  console.log('updated user stats', updatedStats);
  await intoUserDoc.update({
    stats: updatedStats,
    achievements: mergeAchievements(fromUser.achievements, achievements),
    likedPlogs: Object.assign(fromUser.likedPlogs || {}, likedPlogs)
  });

  const regionStats = fromUser.stats && fromUser.stats.total && fromUser.stats.total.region;
  if (!regionStats)
    return;

  const regionIds = Object.keys(regionStats);
  await Promise.all((await whereIn(Regions, regionIds)).map(async doc => {
    const leaderboard = updateLeaderboard(doc.data().leaderboard, intoUserID, regionStats[doc.id]);
    if (leaderboard) {
      console.log('Updating leaderboard for region', doc.id, leaderboard);
      return await doc.update({ leaderboard });
    }
  }));
}

async function deleteUserPlogs(userID) {
  await withBatch(Plogs, ['UserID', '==', userID], (batch, doc) => {
    batch.delete(doc.ref);
  });
}

async function deleteUserFiles(userID) {
  await app.storage().bucket().deleteFiles({
    prefix: `userdata/${userID}`
  });
  await app.storage().bucket().deleteFiles({
    prefix: `userpublic/${userID}`
  });
}

async function deleteUserData(userID) {
  await Users.doc(userID).delete();
  await deleteUserPlogs(userID);
  await deleteUserFiles(userID);
}

/** @type {(fn: (user: admin.auth.UserRecord) => void, perPage?: number ) => Promise<void>} */
async function withUsers(fn, perPage = 1000) {
  /** @type {string} */
  let pageToken;

  while (true) {
    const result = await app.auth().listUsers(perPage, pageToken);
    result.users.forEach(fn);

    if (!(pageToken = result.pageToken))
      break;
  }
}

/**
 * @param {number} [threshold] Consider users who last signed in more than
 *   `threshold` milliseconds ago as inactive
 *
 * @returns {Promise<admin.auth.UserRecord[]>}
 */
async function getInactiveUsers(threshold=86400000*30) {
  const found = [];
  const cutoff = new Date(Date.now() - threshold);

  await withUsers(user => {
    const lastActive = new Date(user.metadata.lastSignInTime || user.metadata.creationTime);
    if (lastActive <= cutoff)
      found.push(user);
  });

  return found;
}

async function getUserIdsToDelete(threshold) {
  const uids = await getInactiveUsers(threshold).then(users => users.map(u => u.uid));
  const uidsToDelete = [];
  await withDocs(Users, [admin.firestore.FieldPath.documentId(), 'in', uids],
                 userDoc => {
                   const {stats} = userDoc.data();
                   if (!stats || !stats.total || !stats.total.count)
                     uidsToDelete.push(userDoc.id);
                 });
  return uidsToDelete;
}

async function deleteInactiveUsers() {
  const uids = await getUserIdsToDelete();
  return await admin.auth().deleteUsers(uids);
}


module.exports = {
  mergeUsers,
  getInactiveUsers,
  deleteUserData,
  deleteUserPlogs,
  deleteUserFiles,
  deleteInactiveUsers,
};
