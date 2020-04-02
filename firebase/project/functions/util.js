const app = require('./app');

const db = app.firestore();
const Plogs = db.collection('plogs');


/**
 * @param {Parameters<typeof Plogs.where>} where
 */
async function updatePlogsWhere(where, changes, limit=100) {
  let query = Plogs.where(...where).limit(limit);

  while (true) {
    const batch = db.batch();
    const plogs = await query.get();

    for (const plog of plogs.docs) {
      batch.update(plog.ref, changes);
    }

    await batch.commit();
    if (plogs.size < limit)
      break;

    query = Plogs.where(...where).limit(limit).startAfter(plogs.docs[plogs.size-1]);
  }
}

module.exports = {
  updatePlogsWhere
};
