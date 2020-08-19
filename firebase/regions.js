import { firebase, Regions } from './init';
import * as $u from '../util/iter';

/** @typedef {import('./project/functions/shared').RegionStats} RegionStats */

/**
 * @template T
 * @typedef {object} NormalizedList
 * @property {string[]} ids
 * @property {{ [k in string]: T }} data
 */

/**
 * @template {NormalizedList<any>} L
 * @typedef {L extends NormalizedList<infer T> ? T[] : never} DenormalizedList
 */

/**
 * @template T
 * @template {keyof T} K
 * @typedef {Omit<T, K> & { [k in K]: DenormalizedList<T[k]> }} Denormalized
 */

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
 * @typedef {object} RegionData
 * @property {string} county
 * @property {string} state
 * @property {string} country
 * @property {string[]} geohashes
 * @property {RegionStats} stats
 * @property {NormalizedList<{ id: string, userID: string, when: Date }>} recentPlogs
 * @property {NormalizedList<RegionLeaderData>} leaderboard
 */

/** @typedef {Denormalized<RegionData, 'recentPlogs' | 'leaderboard'>} Region */

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
    const {leaderboard, recentPlogs, ...data} = region;
    return Object.assign(data, {
      recentPlogs: $u.normList(recentPlogs),
      leaderboard: $u.normList(leaderboard)
    });
  }
};

export const getRegion = (regionId) => Regions.doc(regionId).withConverter(regionConverter);
