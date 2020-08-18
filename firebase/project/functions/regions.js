const app = require('./app');
const admin = require('firebase-admin');
const $u = require('./util');
const { addPlogToRegion } = require('./shared');

const db = app.firestore();
const Regions = db.collection('regions');

/** @typedef {import('./shared').PlogData} PlogData */
/** @typedef {import('./shared').RegionData} RegionData */
/** @typedef {import('./shared').UserStats} UserStats */

/**
 * @template P
 * @typedef { P extends PromiseLike<infer U> ? U : P } Unwrapped
 */

async function deletePlogFromRegions(plogID) {
  await $u.withBatch(Regions, [`recentPlogs.ids`, 'array-contains', plogID],
                     (batch, region) => {
                       batch.update(region, {
                         [`recentPlogs.data.${plogID}.status`]: 'deleted'
                       });
                     });
}


/**
 * @param {admin.firestore.DocumentSnapshot<PlogData>} plog
 * @param {admin.firestore.Transaction} [t]
 */
async function getRegionForPlog(plog, t) {
  const plogData = plog.data();
  const geohash = plogData.g.geohash.slice(0, 7);
  /** @type {admin.firestore.DocumentReference} */
  let regionDoc;
  /** @type {admin.firestore.QueryDocumentSnapshot|admin.firestore.DocumentSnapshot} */
  let regionSnap;
  /** @type {Unwrapped<ReturnType<typeof $u.locationInfoForRegion>>} */
  let regionLocationData;

  {
    const regions = await $u.regionForGeohash(geohash);
    if (regions.size) {
      regionSnap = regions.docs[0];
      regionDoc = regionSnap.ref;
      regionLocationData = regionSnap.data();
      regionLocationData.id = regionSnap.id;
    }
  }

  if (!regionDoc) {
    regionLocationData = await $u.locationInfoForRegion(plogData.coordinates);

    regionDoc = Regions.doc(regionLocationData.id);
    regionSnap = await (t ? t.get(regionDoc) : regionDoc.get(regionDoc));
  }

  return {
    doc: regionDoc, snap: regionSnap, locationInfo: regionLocationData
  };
}

/**
 * @param {PlogDataWithId} plogData
 * @param {admin.firestore.DocumentReference<RegionData>} regionDoc
 * @param {admin.firestore.DocumentSnapshot<RegionData>} regionSnap
 * @param {UserStats} userStats
 * @param {admin.firestore.Transaction} [t]
 */
async function plogCreated(plogData, regionDoc, regionSnap, regionLocationData, userStats, t) {
  const geohash = plogData.g.geohash.slice(0, 7);
  /** @type {RegionData} */
  let regionData;

  // Update the region leaderboard:
  if (regionSnap.exists) {
    regionData = regionSnap.data();
  } else {
    const { county, state, country } = regionLocationData;
    regionData = {
      county,
      state,
      country,
      geohashes: [geohash]
    };
  }
  const changes = addPlogToRegion(regionData, plogData, userStats.total.region[regionDoc.id]);

  if (regionSnap.exists) {
    {
      const geohashes = regionData.geohashes || [];
      if (!geohashes.includes(geohash)) {
        changes['geohashes'] = [geohash].concat(geohashes.slice(0, 50-1));
      }
    }

    if (t)
      t.update(regionDoc, changes);
    else
      await regionDoc.update(changes);

    regionData.recentPlogs = changes.recentPlogs;
  } else {
    Object.assign(regionData, changes);
    if (t)
      t.set(regionDoc, regionData);
    else
      regionDoc.set(regionData);
  }

  return regionData;
}

module.exports = {
  deletePlogFromRegions,
  getRegionForPlog,
  plogCreated,
};
