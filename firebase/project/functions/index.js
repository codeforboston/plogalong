const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('./app');

const { updateAchievements, updateStats, AchievementHandlers } = require('./shared');
const { updatePlogsWhere } = require('./util');

/**
 * Async generator that handles pagination and yields documents satisfying the
 * query.
 *
 * @param {admin.firestore.Query} query
 * @param {number} [limit=100]
 */
async function *queryGen(query, limit=100) {
  let snap = await query.limit(limit).get();

  while (true) {
    yield *snap.docs;

    if (snap.size < limit)
      break;
    snap = await query.startAfter(snap.docs[snap.size-1]).limit(limit).get();
  }
}

const Users = app.firestore().collection('users');
const Plogs = app.firestore().collection('plogs');

/** @typedef {import('./shared').AchievementType} AchievementType */
/**
 * For each achievement type provided, calls the type's reducer (`update`) on
 * each of the user's plogs. Used when a user's achievements data is missing one
 * or more entries.
 *
 * @param {string} userID
 * @param {AchievementType[]} types
 */
async function initAchievements(userID, types) {
  const achievements = types.reduce((m, type) => {
    m[type] = { ...AchievementHandlers[type].initial };
    return m;
  }, {});

  for await (const plog of queryGen(Plogs.where('d.UserID', '==', userID))) {
    const plogData = plog.data().d;
    for (const type of types) {
      if (!achievements[type].complete)
        achievements[type] = AchievementHandlers[type].update(
          achievements[type], plogData);
    }
  }

  return achievements;
}

// TODO Ignore duplicate events
exports.calculateAchievements = functions.firestore.document('/plogs/{documentId}')
  .onCreate(async (snap, context) => {
    const plogData = snap.data().d;
    const {UserID} = plogData;
    let initUserAchievements;
    const userDocRef = Users.doc(UserID);

    await app.firestore().runTransaction(async t => {
      const user = await t.get(userDocRef);
      const userData = user.data();

      const {achievements, needInit} = updateAchievements(userData.achievements, plogData);

      t.update(userDocRef, {
        achievements,
        stats: updateStats(userData.stats, plogData, snap.createTime.toDate())
      });

      initUserAchievements = needInit;
    });

    if (initUserAchievements.length) {
      await app.firestore().runTransaction(async t => {
        t.update(userDocRef, {
          achievements: await initAchievements(UserID, initUserAchievements)
        });
      });
    }
  });


exports.updateUserPlogs = functions.firestore.document('/users/{userId}')
    .onUpdate(async (snap, context) => {
        const before = snap.before.data();
        const after = snap.after.data();

        if (before.profilePicture !== after.profilePicture || before.displayName !== after.displayName) {
          await updatePlogsWhere(
            ['d.UserID', '==', context.params.userId],
            {
              'd.UserProfilePicture': after.profilePicture,
              'd.UserDisplayName': after.displayName,
            });
        }
    });

const { likePlog, loadUserProfile } = require('./http');
exports.likePlog = functions.https.onCall(likePlog);
exports.loadUserProfile = functions.https.onCall(loadUserProfile);
