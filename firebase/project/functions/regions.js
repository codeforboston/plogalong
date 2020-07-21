const app = require('./app');
const admin = require('firebase-admin');
const $u = require('./util');
const { updateStats } = require('./shared');

const db = app.firestore();
const Regions = db.collection('regions');

async function deletePlogFromRegions(plogID) {
  await $u.withBatch(Regions, [`recentPlogs.ids`, 'array-contains', plogID],
                     (batch, region) => {
                       batch.update(region, {
                         [`recentPlogs.data.${plogID}.status`]: 'deleted'
                       });
                     });
}

/** @typedef {import('../../plogs.js').PlogData} PlogData */
/** @typedef {import('../../regions.js').Region} Region */
/** @typedef {{ ids: string[], data: any }} RecentPlogs */
/** @typedef {Omit<Region, 'recentPlogs'> & { recentPlogs: RecentPlogs }} RegionData */
/**
 * @param {RecentPlogs} recentPlogs
 * @param {admin.firestore.DocumentSnapshot<PlogData>} plog
 */
function addPlogToRecents(recentPlogs, plog, maxLength=20) {
  const plogData = plog.data();
  if (!recentPlogs)
    recentPlogs = { ids: [], data: {} };
  if (recentPlogs.ids.push(plog.id) > maxLength) {
    for (const plogID of recentPlogs.ids.slice(maxLength-1))
      delete recentPlogs.data[plogID];

    recentPlogs.ids = recentPlogs.ids.slice(0, maxLength);
  }
  recentPlogs.data[plog.id] = {
    id: plog.id,
    when: plogData.DateTime,
    userID: plogData.UserID
  };
  return recentPlogs;
}

/**
 * @param {RegionData} regionData
 * @param {admin.firestore.DocumentSnapshot<PlogData>} plog
 * @returns {Pick<RegionData>}
 */
function addPlog(regionData, plog) {
  return {
    recentPlogs: addPlogToRecents(regionData.recentPlogs, plog),
    stats: updateStats(regionData.stats, plog.data())
  };
}

/**
 * @param {admin.firestore.DocumentSnapshot<PlogData>} plog
 */
async function plogCreated(plog, t) {
  const plogData = plog.data();
  const { geohash } = plogData.g;
  /** @type {admin.firestore.DocumentReference} */
  let regionDoc;
  /** @type {admin.firestore.QueryDocumentSnapshot|admin.firestore.DocumentSnapshot} */
  let regionSnap;
  let regionLocationData;
  let addGeohash = true;
  let regionData;

  {
    const regions = await $u.regionForGeohash(geohash);
    if (regions.size) {
      regionSnap = regions.docs[0];
      regionDoc = regionSnap.ref;
      addGeohash = false;
    }
  }

  if (!regionDoc) {
    regionLocationData = await $u.locationInfoForRegion(plogData.coordinates);

    regionDoc = Regions.doc(regionLocationData.id);
    regionSnap = await regionDoc.get(regionDoc);
  }

  if (regionSnap.exists) {
    regionData = regionSnap.data();
    const changes = addPlog(regionData, plog);

    if (addGeohash) {
      changes['geohashes'] = [geohash].concat((regionData.geohashes||[]).slice(0, 50-1));
    }

    if (t)
      t.update(regionDoc, changes);
    else
      await regionDoc.update(changes);

    regionData.recentPlogs = updatedRecentPlogs;
  } else {
    const { county, state, country } = regionLocationData;
    regionData = {
      county,
      state,
      country,
      leaderboard: null,
      stats: null,
      recentPlogs: { ids: [], data: {} },
      geohashes: [geohash]
    };
    Object.assign(regionData, addPlog(regionData, plog));
    if (t)
      t.set(regionDoc, regionData);
    else
      regionDoc.set(regionData);
  }

  return regionData;
}

module.exports = {
  addPlog,
  deletePlogFromRegions,
  addPlogToRecents,
  plogCreated
};
