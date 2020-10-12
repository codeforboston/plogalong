const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('./app');

const { updateAchievements, updateUserStats, AchievementHandlers, calculateBonusMinutes, addBonusMinutes, localPlogDate} = require('./shared');
const $u = require('./util');
const regions = require('./regions');
const email = require('./email');

/**
 * @template P
 * @typedef { P extends PromiseLike<infer U> ? U : P } Unwrapped
 */

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

  for await (const plog of queryGen(Plogs.where('UserID', '==', userID))) {
    const plogData = plog.data();
    plogData.LocalDate = localPlogDate(plogData);
    plogData.id = plog.id;
    for (const type of types) {
      if (!achievements[type].complete)
        achievements[type] = AchievementHandlers[type].update(
          achievements[type], plogData);
    }
  }

  return achievements;
}

// TODO Ignore duplicate events
exports.plogCreated = functions.firestore.document('/plogs/{documentID}')
  .onCreate(async (snap, context) => {
    const plogData = snap.data();
    const {UserID} = plogData;
    let initUserAchievements = [];
    const userDocRef = Users.doc(UserID);

    await app.firestore().runTransaction(async t => {
      const userData = await t.get(userDocRef).then(u => u.data());
      /** @type {Unwrapped<ReturnType<typeof regions.getRegionForPlog>>} */
      let regionInfo;

      if (plogData.Public && plogData.coordinates) {
        regionInfo = await regions.getRegionForPlog(snap, t);
      }

      // Update the user stats first. If a region ID is supplied, the user's
      // stats for that region will also be updated
      plogData.id = snap.id;
      let userStats = updateUserStats(userData.stats, plogData, 0, regionInfo && regionInfo.locationInfo.id);

      // regions.plogCreated uses userStats to potentially update the region
      // leaderboard
      const regionData = regionInfo &&
            await regions.plogCreated(plogData, regionInfo.doc, regionInfo.snap, regionInfo.locationInfo, userStats, t);

      // achievements may depend on locally aggregated data (stats, leaderboard)
      const {achievements, completed, needInit} = updateAchievements(userData.achievements, plogData, regionData);
c
      if (completed.length) {
        // add bonus minutes from achievements
        userStats = addBonusMinutes(userStats, localPlogDate(plogData), calculateBonusMinutes(completed));
      }

      t.update(userDocRef, {
        achievements,
        stats: userStats
      });

      if (userStats.total.count > 1) {
        // We don't need to initialize user achievements if this is the user's
        // first plog.
        initUserAchievements = needInit;
      }
    });

    // This code shouldn't need to run too often. The intent is to allow us to
    // add achievements that take will take into account a user's full history
    // of plogs, including those logged before the achievement existed.
    if (initUserAchievements.length) {
      await app.firestore().runTransaction(async t => {
        t.update(userDocRef, {
          achievements: await initAchievements(UserID, initUserAchievements)
        });
      });
    }
  });

exports.plogDeleted = functions.firestore.document('/plogs/{plogID}')
  .onDelete(async (snap, context) => {
    await $u.deletePlogFromRegions(snap.id);
  });

exports.updateUserPlogs = functions.firestore.document('/users/{userId}')
    .onUpdate(async (snap, context) => {
        const before = snap.before.data();
        const after = snap.after.data();

        if (before.profilePicture !== after.profilePicture || before.displayName !== after.displayName) {
          await $u.updatePlogsWhere(
            ['UserID', '==', context.params.userId],
            {
              'UserProfilePicture': after.profilePicture,
              'UserDisplayName': after.displayName,
            });
        }
    });

exports.onCommentCreate = functions.firestore.document('/comments/{commentId}')
  .onCreate(async (snap, context) => {
    const { admin_email: ADMIN_EMAIL } = functions.config().plogalong || {};
    if (!ADMIN_EMAIL)
      return;

    const comment = snap.data();

    await email.send({
      recipients: ADMIN_EMAIL,
      subject: `Comment from ${comment.name}`,
      textContent: comment.comment
    });
  });

const users = require('./users');
exports.onUserDeleted = functions.auth.user().onDelete(async user => {
  await users.deleteUserData(user.uid);
});

const http = require('./http');
exports.likePlog = functions.https.onCall(http.likePlog);
exports.loadUserProfile = functions.https.onCall(http.loadUserProfile);
exports.mergeWithAccount = functions.https.onCall(http.mergeWithAccount);
exports.reportPlog = functions.https.onCall(http.reportPlog);
exports.getRegionInfo = functions.https.onCall(http.getRegionInfo);
exports.getRegionLeaders = functions.https.onCall(http.getRegionLeaders);
exports.userLinked = functions.https.onCall(http.userLinked);
