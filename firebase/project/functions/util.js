const app = require('./app');

const admin = require('firebase-admin');
const functions = require('firebase-functions');
const fetch = require('node-fetch');
const crypto = require('crypto');
const geokit = require('geokit');

const db = app.firestore();
const { Plogs, Regions } = require('./collections');

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

function md5(buff) {
  const hash = crypto.createHash('md5');
  hash.update(buff);
  return hash.digest().toString('hex');
}

const regionForGeohash = geohash =>
      Regions.where('geohashes', 'array-contains', geohash).get();

/// When choosing the precision, we have to strike a balance between the number
/// of Geocoder API calls and the potential for errors around the region
/// borders. A higher precision means that fewer geoh
const GeohashRegionPrecision = 7;

const geohash = coords => geokit.hash(coords, GeohashRegionPrecision);

const regionForCoords = ({ latitude, longitude }) =>
      regionForGeohash(
        geokit.hash({ lat: latitude, lng: longitude }, GeohashRegionPrecision)
      );


const GMAPS_API_KEY =
      process.env.GMAPS_API_KEY ||
      (functions.config().plogalong || {}).google_api_key;


async function locationInfoForRegion(coords) {
  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${encodeURIComponent(GMAPS_API_KEY)}`);
  const data = await response.json();
  let county, state, country;

  for (const {types, short_name} of data.results[0].address_components) {
    if (types.includes('administrative_area_level_2'))
      county = short_name;
    if (types.includes('administrative_area_level_1'))
      state = short_name;
    if (types.includes('country'))
      country = short_name;
  }

  const rawKey = `${county}/${state}/${country}`;

  return {
    // Doesn't need to be cryptographically secure
    id: md5(rawKey),
    county,
    state,
    country
  };
}

/**
 * @param {{ longitude: number, latitude: number }} coords
 */
async function regionInfo(coords, cache=true) {
  const geohash = geokit.hash({ lat: coords.latitude, lng: coords.longitude },
                              GeohashRegionPrecision);
  const regions = await regionForGeohash(geohash);
  if (regions.size) {
    const doc = regions.docs[0];
    const { county, state, country } = doc.data();

    if (cache) {
      Regions.doc(doc.id).update({
        geohashes: admin.firestore.FieldValue.arrayUnion(geohash)
      }).catch(err => {
        console.warn('Error updating region', err);
      });
    }

    return {
      id: doc.id,
      county,
      state,
      country
    };
  }

  const info = await locationInfoForRegion(coords);

  if (cache) {
    const { id, ...region } = info;
    Regions.doc(info.id).set(Object.assign(
      region,
      { geohashes: [geohash] }
    )).catch(err => {
      console.warn('Error saving region', err);
    });
  }

  return info;
}


module.exports = {
  geohash,
  locationInfoForRegion,
  objectFromURL,
  parseStorageURL,
  regionForCoords,
  regionForGeohash,
  regionInfo,
  updatePlogsWhere,
  withBatch,
  withDocs,
};
