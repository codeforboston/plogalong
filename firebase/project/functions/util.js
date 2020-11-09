const app = require('./app');

const admin = require('firebase-admin');
const functions = require('firebase-functions');
const fetch = require('node-fetch');
const crypto = require('crypto');
const geokit = require('geokit');
const vision = require('@google-cloud/vision');

const db = app.firestore();
const { Plogs, Regions } = require('./collections');

const Storage = app.storage();

/**
 * @template P
 * @typedef { P extends PromiseLike<infer U> ? U : P } Unwrapped
 */

/**
 * @template {firebase.firestore.DocumentData} T
 * @param {admin.firestore.CollectionReference<T>} collection
 * @param {Parameters<typeof Plogs.where>} where
 * @param {(batch: admin.firestore.WriteBatch, doc: admin.firestore.QueryDocumentSnapshot<T>) => Promise<any>} fn
 * @param {number} [limit]
 */
async function withBatch(collection, where, fn, limit=100) {
  let doc;

  // XXX Would it be okay to run multiple batches at the same time instead of
  // waiting for each batch to commit?
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
 * @template T
 * @param {T[]} xs
 * @param {number} n
 *
 * @returns {T[][]}
 */
function partition(xs, n) {
  const splitXs = [];
  for (let i = 0, l = xs.length; i < l; i += n) {
    splitXs.push(xs.slice(i, i+n));
  }
  return splitXs;
}

const ArrayContainsMax = 10;

/**
 * @template {firebase.firestore.DocumentData} T
 * @param {admin.firestore.CollectionReference<T>} collection
 * @param {any[]} vals
 *
 * @returns {Promise<firebase.firestore.QueryDocumentSnapshot<T>[]>}
 */
async function whereIn(collection, vals, preservePosition=false) {
  const field = admin.firestore.FieldPath.documentId();
  const results =  await Promise.all(
    partition(vals, ArrayContainsMax)
      .map(vs => collection.where(field, 'in', vs).get().then(res => res.docs))
  ).then(resLists => [].concat(...resLists));

  if (preservePosition) {
    const indexed = results.reduce((m, doc) => {
      m[doc.id] = doc;
      return m;
    }, {});
    return vals.map(id => indexed[id]);
  }

  return results;
}

/**
 * @param {Parameters<typeof Plogs.where>} where
 * @param {firebase.firestore.UpdateData} changes
 */
async function updatePlogsWhere(where, changes, limit=100) {
  await withBatch(Plogs, where,
                  (batch, plog) => {
                    batch.update(plog.ref, changes);
                  },
                  limit);
}

function parseStorageURL(url) {
  const [, bucket, fullPath] = url.startsWith('gs://') ?
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
 * @param {Unwrapped<ReturnType<typeof Regions.get>>} doc
 */
function regionInfoForDoc(doc) {
  const { county, state, country } = doc.data();
  return {
    id: doc.id,
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
    return regionInfoForDoc(regions.docs[0]);
  }

  const info = await locationInfoForRegion(coords);

  if (cache) {
    const { id, ...region } = info;
    Regions.doc(id).update({
      geohashes: admin.firestore.FieldValue.arrayUnion(geohash)
    }).catch(_ => (
      Regions.doc(info.id).set(Object.assign(
        region,
        { geohashes: [geohash] }
      ))
    )).catch(err => {
      console.warn('Error saving region', err);
    });
  }

  return info;
}

const FeatureType = vision.protos.google.cloud.vision.v1.Feature.Type;
const Likelihood = vision.protos.google.cloud.vision.v1.Likelihood;
const NSFWTags = ['racy', 'adult', 'violence'];

/** @typedef {vision.protos.google.cloud.vision.v1.SafeSearchAnnotation} SafeSearchAnnotation */
/** @typedef {vision.protos.google.cloud.vision.v1.AnnotateImageResponse} AnnotateImageResponse */

/**
 * @param {SafeSearchAnnotation} safeSearch
 */
function nsfwTags(safeSearch, nsfwThreshold=Likelihood.LIKELY, tags=NSFWTags) {
  return safeSearch
    ? tags.filter(tag => Likelihood[safeSearch[tag]] >= nsfwThreshold)
    : [];
}


/** @typedef {import('@google-cloud/storage').File} File */

/**
 * @param {File} file
 *
 * @returns {Promise<AnnotateImageResponse]>}
 */
async function detectLabels(file) {
  const client = new vision.ImageAnnotatorClient();
  const url = await file.getSignedUrl({ action: 'read', expires: Date.now()+60000 });
  const [result] = await client.annotateImage({ image: { source: { imageUri: url }},
                                                features: [{ type: FeatureType.SAFE_SEARCH_DETECTION }, 
                                                           { type: FeatureType.LABEL_DETECTION }]});
  return result;
}


module.exports = {
  geohash,
  locationInfoForRegion,
  objectFromURL,
  parseStorageURL,
  regionForCoords,
  regionForGeohash,
  regionInfo,
  regionInfoForDoc,
  updatePlogsWhere,
  whereIn,
  withBatch,
  withDocs,
  detectLabels,
  nsfwTags
};
