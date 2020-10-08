const path = require('path');
const credsFile = path.join(__dirname, 'app-credentials.json');
process.env.GOOGLE_APPLICATION_CREDENTIALS = credsFile;

const admin = require('firebase-admin');
const $u = require('../../util/iter.js');

admin.initializeApp();

const auth = admin.auth();
const firestore = admin.firestore();
const Regions = firestore.collection('regions');


/**
 * @template T
 * @param {$u.NormalizedList<T>} input
 * @param {(a: T, b: T) => number} cmpFn
 *
 * @returns {$u.NormalizedList<T>}
 */
function sortNorm(input, cmpFn) {
  const sortedIds = [...input.ids];
  sortedIds.sort((idA, idB) => cmpFn(input.data[idA], input.data[idB]));
  return { ids: sortedIds, data: input.data };
}

/** @typedef {import('../regions').RegionData} RegionData */
/**
 * @param {(doc: admin.firestore.QueryDocumentSnapshot<RegionData>) => Promise<void>} fn
 */
async function updateLeaderboards(fn) {
  let doc;
  while (true) {
    let query = Regions;

    query = query.limit(100);

    if (doc) query = query.startAfter(doc);

    const docs = await query.get();

    for (doc of docs.docs) await fn(doc);

    if (docs.size < 100)
      break;
  }
}

/**
 * Remove anonymous users from region leaderboards
 */
function updateCollection() {
  return updateLeaderboards(async region => {
    let data = region.data();

    /** @type {RegionData["leaderboard"]} */
    let leaderboard = data.leaderboard;
    if (!data || !leaderboard) return;

    const users = await auth.getUsers(leaderboard.ids.map(uid => ({ uid })));
    const userInfo = $u.indexBy(users.users, 'uid');
    leaderboard = $u.filterNorm(leaderboard, (_, uid) =>
                                userInfo[uid] && userInfo[uid].providerData.length > 0);

    if (data.leaderboard.ids.join('') === leaderboard.ids.join('')) {
      console.log('No change for', data.county, data.state);
    } else {
      console.log('Updating', data.county, data.state);
      console.log('before:', data.leaderboard);
      console.log('after:', leaderboard);
      await region.ref.update({ leaderboard });
    }
  });
}


(async () => {
  await updateCollection();
})();
