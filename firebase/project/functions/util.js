const app = require('./app');

const db = app.firestore();
const Plogs = db.collection('plogs');


/**
 * @template {firebase.firestore.DocumentData} T
 * @param {firebase.firestore.CollectionReference<T>} collection
 * @param {firebase.firestore.Query<T>} where
 * @param {(batch: firebase.firestore.WriteBatch, doc: firebase.firestore.QueryDocumentSnapshot<T>) => null} fn
 * @param {number} [limit]
 */
async function withBatch(collection, where, fn, limit=100) {
  let query = collection.where(...where).limit(limit);

  while (true) {
    const batch = db.batch();
    const docs = await query.get();
    let doc;

    for (doc of docs.docs) {
      fn(batch, doc);
    }

    await batch.commit();
    if (docs.size < limit)
      break;

    query = collection.where(...where).limit(limit).startAfter(doc);
  }
}

/**
 * @param {Parameters<typeof Plogs.where>} where
 */
async function updatePlogsWhere(where, changes, limit=100) {
  await withBatch(Plogs, where,
                  (batch, plog) => {
                    batch.update(plog.ref, changes);
                  },
                  limit);
}

module.exports = {
  updatePlogsWhere,
  withBatch
};
