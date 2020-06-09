const app = require('./app');

const { updatePlogsWhere, withBatch } = require('./util');

const Plogs = app.firestore().collection('plogs');
const Users = app.firestore().collection('users');

async function mergeUsers(fromUserID, toUserID) {
  const userDoc = await Users.doc(toUserID).get();
  const { displayName, profilePicture } = userDoc.data();
  await updatePlogsWhere(
    ['d.UserID', '==', fromUserID],
    {
      'd.UserID': toUserID,
      'd.UserDisplayName': displayName,
      'd.UserProfilePicture': profilePicture
    }
  );
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

module.exports = {
  mergeUsers,
  deleteUserData,
  deleteUserPlogs,
  deleteUserFiles
};
