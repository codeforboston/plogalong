import { functions } from './init';


const _likePlog = functions.httpsCallable('likePlog');
const _loadUserProfile = functions.httpsCallable('loadUserProfile');

/**
 * @param {string} plogID
 * @param {boolean} [like=true]
 */
export async function likePlog(plogID, like=true) {
  return await _likePlog({ plog: plogID, like });
}

/**
 * @param {string} userID
 */
export async function loadUserProfile(userID) {
  return (await _loadUserProfile({userID})).data;
}
