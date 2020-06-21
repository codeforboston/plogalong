const app = require('./app');
const admin = require('firebase-admin');

const { updatePlogsWhere, withBatch, withDocs } = require('./util');

const Plogs = app.firestore().collection('plogs');
const Users = app.firestore().collection('users');

async function mergeUsers(fromUserID, toUserID) {
  const userDoc = await Users.doc(toUserID).get();
  const { displayName, profilePicture } = userDoc.data();
  const updates = { 'd.UserID': toUserID, };

  if (displayName)
    updates['d.UserDisplayName'] = displayName;
  if (profilePicture)
    updates['d.UserProfilePicture'] = profilePicture;

  await updatePlogsWhere(['d.UserID', '==', fromUserID], updates);
}

async function deleteUserPlogs(userID) {
  await withBatch(Plogs, ['d.UserID', '==', userID], (batch, doc) => {
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
