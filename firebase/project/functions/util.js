const app = require('./app');
const admin = require('firebase-admin');

const db = app.firestore();
const Plogs = db.collection('plogs');

/**
 * @template {firebase.firestore.DocumentData} T
 * @param {admin.firestore.CollectionReference<T>} collection
 * @param {Parameters<typeof Plogs.where>} where
 * @param {(batch: admin.firestore.WriteBatch, doc: admin.firestore.QueryDocumentSnapshot<T>) => null} fn
 * @param {number} [limit]
 */
async function withBatch(collection, where, fn, limit=100) {
  let doc;

  while (true) {
    let query = collection;
    if (where) query = query.where(...where);

    query = query.limit(limit);

    if (doc) query = query.startAfter(doc);

    const batch = db.batch();
    const docs = await query.get();

    for (doc of docs.docs) fn(batch, doc);


    await batch.commit();
    if (docs.size < limit)
      break;
  }
}

/**
 * @template {firebase.firestore.DocumentData} T
 * @param {admin.firestore.CollectionReference<T>} collection
 * @param {Parameters<typeof Plogs.where>} where
 * @param {(doc: admin.firestore.QueryDocumentSnapshot<T>) => null} fn
 * @param {number} [limit]
 */
async function withDocs(collection, where, fn, limit=100) {
  let doc;

  while (true) {
    let query = collection;
    if (where) query = query.where(...where);

    query = query.limit(limit);

    if (doc) query = query.startAfter(doc);

    const docs = await query.get();

    for (doc of docs.docs) fn(doc);

    if (docs.size < limit)
      break;
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
  withBatch,
  withDocs,
};
