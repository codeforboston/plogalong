import { functions } from './init';


const _likePlog = functions.httpsCallable('likePlog');

/**
 * @param {string} plogID
 * @param {boolean} [like=true]
 */
export async function likePlog(plogID, like=true) {
  return await _likePlog({ plog: plogID, like });
}
