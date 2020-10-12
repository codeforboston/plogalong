const path = require('path');
const credsFile = path.join(__dirname, 'app-credentials.json');
process.env.GOOGLE_APPLICATION_CREDENTIALS = credsFile;

const admin = require('firebase-admin');
const { GeoFirestore, GeoCollectionReference } = require('geofirestore');

/**
 * Set the collection to update here.
 */
const COLLECTION_NAME = "plogs";
/**
 * If you use a custom key, define it here, otherwise leave this.
 */
const CUSTOM_KEY = "coordinates";

admin.initializeApp();

const firestore = admin.firestore();
const geofirestore = new GeoFirestore(firestore);
const collection = firestore.collection(COLLECTION_NAME);
const geocollection = new GeoCollectionReference(collection);
let totalUpdated = 0;

function updateCollection(query) {
  return new Promise((resolve, reject) =>
    deleteQueryBatch(query.limit(500), resolve, reject)
  );
}

function deleteQueryBatch(query, resolve, reject) {
  query
    .get()
    .then((snapshot) => {
      // When there are no documents left, we are done
      if (snapshot.size === 0) {
        console.log(`DONE, UPDATED ${totalUpdated}`);
        return 0;
      }

      console.log(
        `UPDATING ${snapshot.size} GEODOCUMENTS, ALREADY UPDATED ${totalUpdated}`
      );

      // Update documents in a batch
      const batch = geofirestore.batch();
      snapshot.docs.forEach((doc) => {
        const geodoc = geocollection.doc(doc.id);
        batch.set(geodoc, doc.data().d, { customKey: CUSTOM_KEY });
      });

      return batch.commit().then(() => snapshot.size);
    })
    .catch((e) => {
      console.warn(
        "This script was unable to convert your collection for GeoFirestore v4.",
        e.details
      );
      return 0;
    })
    .then((numUpdated) => {
      totalUpdated += numUpdated;
      if (numUpdated === 0) {
        resolve();
        return;
      }
      process.nextTick(() => deleteQueryBatch(query, resolve, reject));
    })
    .catch((err) => reject(err));
}

(async () => {
  await updateCollection(collection.orderBy("g").orderBy("l").orderBy("d"));
})();
