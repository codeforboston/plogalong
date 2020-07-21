import { firebase, Regions } from './init';

/** @typedef {import('./project/functions/shared').RegionStats} RegionStats */


/**
 * @typedef {object} Region
 * @property {string} county
 * @property {string} state
 * @property {string} country
 * @property {string[]} geohashes
 * @property {{ id: string, userID: string, when: Date }[]} recentPlogs
 * @property {RegionStats} stats
 * @property leaderboard
 */

/** @type {firebase.firestore.FirestoreDataConverter<Region>} */
const regionConverter = {
  fromFirestore(snapshot, options) {
    const {recentPlogs, ...data} = snapshot.data();
    return Object.assign(data, {
      recentPlogs: recentPlogs ?
        recentPlogs.ids.map(id => recentPlogs.data[id]) : []
    });
  },

  toFirestore(region) {
    const {recentPlogs, ...data} = region;
    return Object.assign(data, {
      recentPlogs:
        (recentPlogs || []).reduce((rp, plog) => {
          rp.ids.push(plog.id);
          rp.data[plog.id] = plog;
        }, { ids: [], data: {} })
    });
  }
};

export const getRegion = (regionId) => Regions.doc(regionId).withConverter(regionConverter);
