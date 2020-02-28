const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('./app');

const { timeUnits } = require('./shared');


function _makeCountAchievement(target) {
    return {
        /**
         * @param {admin.firestore.QuerySnapshot} plogs
         */
        init(plogs) {
            const {size} = plogs;
            return {
                completed: size >= target ? new Date() : null,
                updated: new Date(),
                count: Math.min(size, target),
                // firstPlog: size && plogs.docs[0].ref,
                // latestPlog: size && plogs.docs[(size >= target ? target : size) - 1],
            };
        },
        update(previous, plogData) {
            const {count = 0, firstPlog} = previous;
            return {
                completed: count + 1 >= target ? plogData.DateTime : null,
                updated: plogData.DateTime,
                count: count + 1,
                // firstPlog: firstPlog || plog,
                // latestPlot: plog,
            };
        }
    };
}

const AchievementTypes = new Map([
    ['firstPlog', {
        init(plogs) {
            const plog = plogs.size && plogs.docs[0];
            return {
                completed: plog ? plog.createTime : null
            };
        },
        update(_, plogData) {
            return { completed: plogData.DateTime };
        }
    }],

    ['100Club', _makeCountAchievement(100)],
    ['1000Club', _makeCountAchievement(1000)]
]);

/**
 * @param {admin.firestore.DocumentReference} user
 * @param {admin.firestore.DocumentReference} plog
 * @param {any} plogData
 */
async function updateAchievements(user, plog, plogData) {
    let {achievements} = await user.get();
    if (!achievements) achievements = {};
    const needInit = [];

    for (let [achievementType, {init, update}] of AchievementTypes.entries()) {
        const achievement = achievements[achievementType];
        if (!achievement) {
            needInit.push(achievementType);
        } else if (!achievement.complete) {
            achievements[achievementType] = update(achievement || {}, plogData, plog);
        }
    }

    if (needInit.length) {
        const plogs = await admin.firestore().collection('/plogs').where('UserID', '==', user.id).get();

        for (let type of needInit) {
            const {init} = AchievementTypes.get(type);
            if (init)
                achievements[type] = init(plogs);
        }
    }

    console.log(achievements);

    user.set({achievements}, {merge: true});
}

/**
 * @param {UserData} user
 * @param {PlogData} plog
 */
async function updateAchievements(user, plog) {
  const achievements = user.achievements || {};
  const needInit = [];

  for (let [achievementType, {init, update}] of AchievementTypes.entries()) {
    const achievement = achievements[achievementType];
    if (!achievement) {
      needInit.push(achievementType);
    } else if (!achievement.complete) {
      achievements[achievementType] = update(achievement || {}, plog);
    }
  }

  if (needInit.length) {
    const plogs = await admin.firestore().collection('/plogs').where('UserID', '==', user.id).get();

    for (let type of needInit) {
      const {init} = AchievementTypes.get(type);
      if (init)
        achievements[type] = init(plogs);
    }
  }

  console.log(achievements);

  return achievements;
}

/** @typedef {import('./shared').UserData} UserData */

/**
/**
 * @param {UserData} user
 * @param {PlogData} plog
 */
function updateStats(user, plog, date=new Date()) {
    const { stats = {} } = user;

    for (let {unit, when} of timeUnits) {
        const whenValue = when(date);
        let unitStats = stats[unit];
        if (!unitStats || unitStats.whenID !== whenValue) {
            unitStats = { milliseconds: 0, count: 0, whenID: whenValue };
            stats[unit] = unitStats;
        }

        unitStats.milliseconds += plog.PlogDuration || 0;
        unitStats.count += 1;
    }

    return stats;
}

exports.calculateAchievements = functions.firestore.document('/plogs/{documentId}')
    .onCreate(async (snap, context) => {
        const plogData = snap.data().d;
        const {UserID} = plogData;

        await app.firestore().runTransaction(async t => {
            const userDocRef = app.firestore().collection('users').doc(UserID);
            const user = await t.get(userDocRef);
            t.update(userDocRef, {
                stats: updateStats(user.data(), plogData, snap.createTime.toDate())
            });
        });
        // return updateAchievements(admin.firestore().collection('users').doc(UserID), snap.ref, plogData);
    });


exports.updateUserPlogs = functions.firestore.document('/users/{userId}')
    .onUpdate(async (snap, context) => {
        const before = snap.before.data();
        const after = snap.after.data();

        if (before.profilePicture !== after.profilePicture || before.displayName !== after.displayName) {
            const db = app.firestore();
            const Plogs = db.collection('/plogs');
            const where = ['d.UserID', '==', context.params.userId];
            const limit = 100;

            let query = Plogs.where(...where).limit(limit);

            while (true) {
                const batch = db.batch();
                const plogs = await query.get();

                for (const plog of plogs.docs) {
                    batch.update(plog.ref, {
                        'd.UserProfilePicture': after.profilePicture,
                        'd.UserDisplayName': after.displayName,
                    });
                }

                await batch.commit();
                if (plogs.size < limit)
                    break;

                query = Plogs.where(...where).limit(limit).startAfter(plogs.docs[plogs.size-1]);
            }
        }
    });

const { likePlog } = require('./http');
exports.likePlog = functions.https.onCall(likePlog);
