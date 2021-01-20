const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('./app');

const { updateAchievements, updateUserStats, AchievementHandlers, calculateBonusMinutes, addBonusMinutes, localPlogDate, tallyBonusMinutes } = require('./shared');
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

const { Users, Plogs } = require('./collections');

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
  .onCreate(async (snap, _context) => {
    /** @type {import('./shared').PlogData} */
    const plogData = snap.data();
    const {UserID} = plogData;
    let initUserAchievements = [];
    const userDocRef = Users.doc(UserID);

    await app.firestore().runTransaction(async t => {
      /** @type {import('./shared').UserData} */
      const userData = await t.get(userDocRef).then(u => u.data());
      try {
        // Already processed this plog
        if (userData.stats.latest.id === snap.id)
          return;
      } catch (_) {}

      /** @type {Unwrapped<ReturnType<typeof regions.getRegionForPlog>>} */
      let regionInfo;

      if (plogData.Public && plogData.coordinates) {
        regionInfo = await regions.getRegionForPlog(snap, t);
        console.log('Found region for plog:', regionInfo.locationInfo.id);
      }

      plogData.id = snap.id;

      // Update the user stats first, initializing them if necessary. If a
      // region ID is supplied, the user's stats for that region will also be
      // updated
      let userStats = updateUserStats(userData.stats, plogData, 0, regionInfo && regionInfo.locationInfo.id);

      // regions.plogCreated uses userStats to potentially update the region
      // leaderboard
      const regionData = regionInfo &&
            await regions.plogCreated(plogData, regionInfo.snap, regionInfo.locationInfo, userStats, t);

      // achievements may depend on locally aggregated data (stats, leaderboard)
      const {achievements, completed, needInit} = updateAchievements(userData.achievements, plogData, regionData);

      if (completed.length) {
        console.log(`completed achievements:`, completed);
        // add bonus minutes from achievements
        userStats = addBonusMinutes(userStats, localPlogDate(plogData), calculateBonusMinutes(completed));
      }

      if (isNaN(userStats.total.bonusMinutes)) {
        // Recalculate all bonus minutes if necessary
        userStats.total.bonusMinutes = tallyBonusMinutes(achievements);
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

// exports.plogDeleted = functions.firestore.document('/plogs/{plogID}')
//   .onDelete(async (snap, context) => {
//   });

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

exports.onImageUpload = functions.storage.bucket('plogalong-a723a.appspot.com').object().onFinalize(async (object, context) => {
  const match = object.name.match(/^user(data|public|test)\/.*?\.jpe?g/i);

  if (match) {
    // Storage rules prevent clients from setting arbitrary metadata on files
    if (object.metadata && object.metadata.scanned) {
      console.log('Skipping scan for', object.name, '(already scanned)');
      return;
    }

    const file = app.storage().bucket(object.bucket).file(object.name);

    try {
      if (context.authType !== 'ADMIN' && match[1] !== 'test') {
        const plogPath = object.name.match(/^user(?:data|public)\/([a-z0-9]+)\/plog\/([a-z0-9]+)\/(\d+)\.jpe?g/i);

        if (plogPath) {
          const plog = await Plogs.doc(plogPath[2]).get();
          if (!plog.exists || plog.data().UserID !== plogPath[1]) {
            console.log('Deleting file', object.name, 'for nonexistent plog ID:', plogPath[2]);
            await file.delete();
            return;
          }
        }
      }

      console.log('Scanning user-uploaded file', object.name);
      const { safeSearchAnnotation, labelAnnotations } = await $u.detectLabels(file);
      const fileMeta = {
        scanned: '1',
        'marked-safe': '1',
        labels: JSON.stringify(
          labelAnnotations.map(({ mid, description }) => ({ mid, description }))
        )
      };

      const nsfwTags = $u.nsfwTags(safeSearchAnnotation);
      if (nsfwTags.length) {
        fileMeta['nsfw-tags'] = nsfwTags.join(',');
        fileMeta['marked-safe'] = '0';
      }

      console.log('Setting metadata:', JSON.stringify(fileMeta));
      file.setMetadata({ metadata: fileMeta }).catch(err => {
        console.error('Unable to set file metadata on', object.name, err);
      });
    } catch (err) {
      console.log(err);
    }
  }
});

const http = require('./http');
exports.likePlog = functions.https.onCall(http.likePlog);
exports.loadUserProfile = functions.https.onCall(http.loadUserProfile);
exports.mergeWithAccount = functions.https.onCall(http.mergeWithAccount);
exports.reportPlog = functions.https.onCall(http.reportPlog);
exports.getRegionInfo = functions.https.onCall(http.getRegionInfo);
exports.getRegionLeaders = functions.https.onCall(http.getRegionLeaders);
exports.userLinked = functions.https.onCall(http.userLinked);
exports.httpEndpoint = functions.https.onCall(http.httpEndpoint);