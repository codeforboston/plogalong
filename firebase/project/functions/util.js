const app = require('./app');
const admin = require('firebase-admin');

const db = app.firestore();
const Plogs = db.collection('plogs');

const Storage = app.storage();

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

    for (doc of docs.docs) await fn(batch, doc);


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

function parseStorageURL(url) {
  const [_, bucket, fullPath] = url.startsWith('gs://') ?
        url.match(/gs:\/\/([A-Za-z0-9.\-_]+)(\/([^?#]*).*)?$/) :
        url.match(/\/v\d+\/b\/([A-Za-z0-9.\-_]+)\/o(\/([^?#]*).*)?$/);
  const idx = fullPath.indexOf('?');
  const path = idx >= 0 ? decodeURIComponent(fullPath.slice(0, idx)) : fullPath;
  const params = idx >= 0 ? fullPath.slice(idx) : null;

  return {
    bucket,
    path,
    params
  };
}

function objectFromURL(url) {
  const { bucket, path } = parseStorageURL(url);
  return Storage.bucket(bucket).file(path);
}


module.exports = {
  objectFromURL,
  parseStorageURL,
  updatePlogsWhere,
  withBatch,
  withDocs,
};
