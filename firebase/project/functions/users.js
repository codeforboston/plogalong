const app = require('./app');

const { updatePlogsWhere } = require('./util');

const Users = app.firestore().collection('plogs');


async function mergeUsers(fromUserID, toUserID) {
  const { displayName, profilePicture } = (await Users.doc(toUserID).get()).data();
  await updatePlogsWhere(
    ['d.UserID', '==', fromUserID],
    {
      'd.UserID': toUserID,
      'd.UserDisplayName': displayName,
      'd.UserProfilePicture': profilePicture
    }
  );
}

exports.mergeUsers = mergeUsers;
