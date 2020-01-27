const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();


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

exports.calculateAchievements = functions.firestore.document('/plogs/{documentId}')
    .onCreate(async (snap, context) => {
        const plogData = snap.data();
        const {UserID} = plogData;

        return updateAchievements(admin.firestore().collection('users').doc(UserID), snap.ref, plogData);
    });

