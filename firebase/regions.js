import { firebase, Regions } from './init';
import * as $iter from '../util/iter';

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
  * @typedef {object} RecentPlog
  * @property {string} id
  * @property {string} userID
  * @property {Date} when
  * @property {{ name: string}[]} [achievements]
  */

/**
 * @typedef {object} RegionData
 * @property {string} county
 * @property {string} state
 * @property {string} country
 * @property {string[]} geohashes
 * @property {RegionStats} stats
 * @property {$iter.NormalizedList<RecentPlog>} recentPlogs
 * @property {$iter.NormalizedList<RegionLeaderData>} leaderboard
 */

/** @returns {firebase.firestore.DocumentReference<RegionData>} */
export const getRegion = (regionId) => Regions.doc(regionId);
