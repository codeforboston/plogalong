const admin = require('firebase-admin');
const $u = require('./util');
const { addPlogToRegion, updateLeaderboard, timeUnits } = require('./shared');

const { Regions, Users } = require('./collections');

/** @typedef {import('./shared').PlogData} PlogData */
/** @typedef {import('./shared').PlogDataWithId} PlogDataWithId */
/** @typedef {import('./shared').RegionData} RegionData */
/** @typedef {import('./shared').UserData} UserData */
/** @typedef {import('./shared').UserStats} UserStats */
/** @typedef {import('./shared').TimeUnit} TimeUnit */

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


/** @typedef {Unwrapped<ReturnType<typeof $u.locationInfoForRegion>>} LocationInfo */
/**
 * @param {admin.firestore.DocumentSnapshot<PlogData>} plog
 * @param {admin.firestore.Transaction} [t]
 */
async function getRegionForPlog(plog, t) {
  const plogData = plog.data();
  const geohash = plogData.g.geohash.slice(0, 7);
  /** @type {ReturnType<typeof Regions.doc>} */
  let regionDoc;
  /** @type {Unwrapped<ReturnType<typeof Regions.get>>} */
  let regionSnap;
  /** @type {LocationInfo} */
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
 * @param {admin.firestore.DocumentSnapshot<RegionData>} regionSnap
 * @param {LocationData} regionLocationData
 * @param {UserStats} userStats
 * @param {admin.firestore.Transaction} [t]
 */
async function plogCreated(plogData, regionSnap, regionLocationData, userStats, t) {
  const regionDoc = regionSnap.ref;
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

  const user = await admin.auth().getUser(plogData.UserID);
  const isAnonymous = !user.providerData.length;
  const changes = addPlogToRegion(regionData, plogData, userStats.total.region[regionDoc.id], !isAnonymous);

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
      await regionDoc.set(regionData);
  }

  return regionData;
}

/**
 * Add a previously unranked user (usually one who was plogging anonymously) to
 * the leaderboards for any regions where they've recorded plogs.
 *
 * @param {string} userID
 * @param {UserStats} userStats
 * @param {firebase.firestore.Transaction} t
 *
 * @returns {Promise<string[]>} ids of updated regions
 */
async function updateLeaderboardsForUser(userID, userStats, t) {
  const regionTotals = userStats && userStats.total && userStats.total.region;
  const updated = [];

  if (regionTotals) {
    const regionIDs = Object.keys(regionTotals);
    const regions = await Promise.all(regionIDs.map(id => t.get(Regions.doc(id))));

    for (const region of regions) {
      if (!region.exists) continue;

      const regionData = region.data();
      const update = updateLeaderboard(
        regionData.leaderboard, userID, regionTotals[region.id]);

      if (update) {
        t.update(region.ref, { leaderboard: update });
        updated.push(region.id);
      }
    }
  }

  return updated;
}

/**
 * @param {string} regionID
 * @param {number} [max]
 * @param {TimeUnit} [unit]
 *
 * @returns {Promise<(UserData & { id: string })[]>}
 */
async function getLeaders(regionID, max=20, unit='total') {
  const field = `stats.${unit}.region.${regionID}.count`;
  const { when } = timeUnits.find(tu => tu.unit === unit);
  const whenID = when(new Date());

  const results = [];
  let lastDoc;
  let left = max;

  while (left > 0) {
    const limit = Math.ceil(left * 1.5);
    let query = Users.where(field, '>=', 1).orderBy(field).limitToLast(left);

    if (lastDoc)
      query = query.endBefore(lastDoc);

    const snap = await query.get();

    for (const user of snap.docs.reverse()) {
      const userData = user.data();
      if (!userData.providers) continue;
      if (userData.stats[unit].whenID !== whenID) continue;

      userData.id = user.id;
      results.push(userData);
    }

    if (snap.size < limit)
      break;

    lastDoc = snap.docs[limit-1];
    left = max - results.length;
  }

  return results;
}


module.exports = {
  deletePlogFromRegions,
  getRegionForPlog,
  plogCreated,
  updateLeaderboardsForUser,
  getLeaders,
};
