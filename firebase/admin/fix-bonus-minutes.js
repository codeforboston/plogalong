const path = require('path');
const credsFile = path.join(__dirname, 'app-credentials.json');
process.env.GOOGLE_APPLICATION_CREDENTIALS = credsFile;

const admin = require('firebase-admin');
const shared = require('../project/functions/shared');

admin.initializeApp();

const firestore = admin.firestore();
const Users = firestore.collection('users');

/**
 * @template {firebase.firestore.DocumentData} T
 * @param {(batch: admin.firestore.WriteBatch, doc: admin.firestore.QueryDocumentSnapshot<T>) => null} fn
 */
async function updateUsers(fn) {
  let doc;
  while (true) {
    let query = Users;

    query = query.limit(100);

    if (doc) query = query.startAfter(doc);

    const batch = firestore.batch();
    const docs = await query.get();

    for (doc of docs.docs) await fn(batch, doc);

    await batch.commit();
    if (docs.size < 100)
      break;
  }
}

function updateCollection() {
  return updateUsers((batch, user) => {
    let { achievements, stats } = user.data();
    if (!achievements || !stats || !stats.total) return;

    const completed = Object.keys(achievements).filter(k => achievements[k] && achievements[k].completed);
    const bonusMinutes = shared.calculateBonusMinutes(completed);
    if (bonusMinutes !== stats.total.bonusMinutes) {
      batch.update(user.ref, { 'stats.total.bonusMinutes': bonusMinutes });
    }
  });
}


(async () => {
  await updateCollection();
})();
