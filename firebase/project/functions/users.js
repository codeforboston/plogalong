const app = require('./app');
const admin = require('firebase-admin');
const uuid = require('uuid');

const { mergeAchievements, mergeStats, updateLeaderboard, removeFromLeaderboard, updateAchievements, updateStats, tallyBonusMinutes } = require('./shared');
const { withBatch, withDocs, whereIn } = require('./util');

const { Plogs, Users, Regions } = require('./collections');

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

        // https://googleapis.dev/nodejs/storage/latest/File.html#move
        console.log('renaming', file.name, '->', destFile.name);
        await file.copy(destFile);
        const token = uuid.v4();
        await destFile.setMetadata({ firebaseStorageDownloadTokens: token });
        await file.delete();

        const publicURL = `https://firebasestorage.googleapis.com/v0/b/${destFile.bucket.name}/o/${encodeURIComponent(destFile.name)}?alt=media&token=${token}`;

        if (!moved[plogID])
          moved[plogID] = [];
        moved[plogID].push(publicURL);
      } catch (er) {
        console.error(`Couldn't move ${file.name}:`, er);
        return;
      }
    }));
  }


  await withBatch(Plogs, ['UserID', '==', fromUserID], async (batch, plogDoc) => {
    batch.update(plogDoc.ref, {
      Photos: moved[plogDoc.id] || [],
      ...updates
    });
  });
}

/**
 * Merge user accounts by moving the plogs from `fromUserID` to `intoUserID`, including any accompanying photos. Additionally, merge achievements and stats.
 */
async function mergeUsers(intoUserID, fromUserID) {
  const promises = [];

  const intoUserDoc = Users.doc(intoUserID);
  const [intoUserData, fromUserData] = await whereIn(Users, [intoUserID, fromUserID], true).then(
    snaps => snaps.map(snap => snap.data())
  );
  const { displayName, profilePicture, stats, achievements, likedPlogs } = intoUserData;
  const updates = { 'UserID': intoUserID };

  if (displayName)
    updates['UserDisplayName'] = displayName;
  if (profilePicture)
    updates['UserProfilePicture'] = profilePicture;

  promises.push(migrateUserPlogs(fromUserID, intoUserID, updates));

  const updatedStats = mergeStats(fromUserData.stats, stats);
  const updatedAchievements = mergeAchievements(fromUserData.achievements, achievements);
  updatedStats.total.bonusMinutes = tallyBonusMinutes(updatedAchievements);

  promises.push(intoUserDoc.update({
    stats: updatedStats,
    achievements: updatedAchievements,
    likedPlogs: Object.assign(fromUserData.likedPlogs || {}, likedPlogs)
  }));

  const regionStats = fromUserData.stats && fromUserData.stats.total && fromUserData.stats.total.region;
  if (regionStats) {
    // Update the leaderboard for regions where fromUser has plogged
    const regionIds = Object.keys(regionStats);
    promises.push(whereIn(Regions, regionIds).then(regions => regions.map(async doc => {
      let leaderboard = updateLeaderboard(doc.data().leaderboard, intoUserID, regionStats[doc.id]);

      if (!leaderboard) return;

      leaderboard = removeFromLeaderboard(leaderboard, fromUserID);
      await doc.ref.update({ leaderboard });
    })));
  }

  await Promise.all(promises);
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
