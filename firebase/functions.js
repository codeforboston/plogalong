import { functions } from './init';
import * as firebase from 'firebase';

import { update } from '../util/iter';

const _likePlog = functions.httpsCallable('likePlog');
const _loadUserProfile = functions.httpsCallable('loadUserProfile');

/**
 * @param {string} plogID
 * @param {boolean} [like=true]
 */
export async function likePlog(plogID, like=true) {
  return await _likePlog({ plog: plogID, like });
}

const convertStamp = val => (val && new firebase.firestore.Timestamp(val._seconds, val._nanoseconds));
/**
 * @param {string} userID
 */
export async function loadUserProfile(userID) {
  const {data} = (await _loadUserProfile({userID}));
  return update(data, {
    'achievements.*': {
      completed: convertStamp,
      updated: convertStamp
    }
  });
}
