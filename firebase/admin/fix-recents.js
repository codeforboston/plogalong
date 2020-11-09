const path = require('path');
const credsFile = path.join(__dirname, 'app-credentials.json');
process.env.GOOGLE_APPLICATION_CREDENTIALS = credsFile;

const admin = require('firebase-admin');

admin.initializeApp();

const firestore = admin.firestore();
const Regions = firestore.collection('regions');


/** @typedef {import('../regions').RegionData} RegionData */
/**
 * @param {(doc: admin.firestore.QueryDocumentSnapshot<RegionData>) => Promise<void>} fn
 */
async function updateRegions(fn) {
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
  return updateRegions(async region => {
    let data = region.data();

    if (!data.recentPlogs) return;

    const recents = Object
          .values(data.recentPlogs.data)
          .sort((a, b) => (b.when.toMillis() - a.when.toMillis()))
          .slice(0, 20);
    const ids = recents.map(r => r.id);

    const updatedRecents = {
      ids,
      data: recents.reduce((m, p) => {
        m[p.id] = p;
        return m;
      }, {})
    };

    region.ref.update({
      recentPlogs: updatedRecents
    });
  });
}


(async () => {
  await updateCollection();
})();
