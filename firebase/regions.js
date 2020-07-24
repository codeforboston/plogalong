import { firebase, Regions } from './init';
import * as $u from '../util/iter';

/** @typedef {import('./project/functions/shared').RegionStats} RegionStats */

/**
 * @typedef {object} RegionLeaderData
 * @property {number} count
 * @property {number} milliseconds
 */
/**
 * @typedef {Object} Leaderboard
 * @property {string[]} ids user IDs
 * @property {{ [k in string]: RegionLeaderData }} data
 */

/**
 * @typedef {object} Region
 * @property {string} county
 * @property {string} state
 * @property {string} country
 * @property {string[]} geohashes
 * @property {{ id: string, userID: string, when: Date }[]} recentPlogs
 * @property {RegionStats} stats
 * @property {Leaderboard} leaderboard
 */

/** @type {firebase.firestore.FirestoreDataConverter<Region>} */
const regionConverter = {
  fromFirestore(snapshot, options) {
    const {leaderboard, recentPlogs, ...data} = snapshot.data();
    return Object.assign(data, {
      recentPlogs: $u.denormList(recentPlogs, { idKey: null }),
      leaderboard: $u.denormList(leaderboard)
    });
  },

  toFirestore(region) {
    const {recentPlogs, ...data} = region;
    return Object.assign(data, {
      recentPlogs: $u.normList(recentPlogs)
    });
  }
};

export const getRegion = (regionId) => Regions.doc(regionId).withConverter(regionConverter);
