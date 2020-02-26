const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/** @template T, S
  * @typedef {{ [K in keyof T]: T[K] extends S ? K : never }} WithValueType
  */
/** @template T, S
  * @typedef {keyof Pick<T, WithValueType<T, S>[keyof T]>} KeysWithValueType
  */

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
        update(previous, plogData, plog) {
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
        update(_, plogData, plog) {
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
 * Records aggregated stats for a particular time unit
 *
 * @typedef {object} PlogStats
 * @property {string} whenID - used as an identifier for the unit on which the
 *   stats are aggregated. E.g., if the user's most recent plog is on 4/3/21,
 *   the year PlogStats would have a `whenID` value of `2021` and the `month`
 *   PlogStats would have a `whenD` value of `2021-4`
 * @property {number} milliseconds - total time plogged during this time period
 * @property {number} count
 */

/**
 * Caches general stats about usage, including aggregates for the month and year
 * when the user most recently plogged.
 *
 * @typedef {object} UserStats
 * @property {PlogStats} [month]
 * @property {PlogStats} [year]
 * @property {PlogStats} [total]
 */

/** @typedef {KeysWithValueType<UserStats, PlogStats>} TimeUnit */
/** @typedef {{ unit: TimeUnit, when: (dt: Date) => string }} TimeUnitConfig */

/** @type {TimeUnitConfig[]} */
const timeUnits = [
    { unit: 'month', when: dt => `${dt.getFullYear()}-${dt.getMonth()+1}` },
    { unit: 'year', when: dt => ''+dt.getFullYear() },
    { unit: 'total', when: _ => 'total' },
];

/**
 * @typedef {object} UserData
 * @property {UserStats} stats
 */

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

