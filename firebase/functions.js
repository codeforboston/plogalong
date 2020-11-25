import { functions } from './init';
import * as firebase from 'firebase';

import { update } from '../util/iter';

const _httpEndpoint = functions.httpsCallable('httpEndpoint');

/**
 * @param {string} plogID
 * @param {boolean} [like=true]
 */
export async function likePlog(plogID, like=true) {
  return await _httpEndpoint({ type: 'likePlog', payload: { plog: plogID, like }});
}

const convertStamp = val => (val && new firebase.firestore.Timestamp(val._seconds, val._nanoseconds));

/** @typedef {import('./project/functions/http').UserProfile} UserProfile */
/**
 * @param {string} userID
 * @returns {Promise<UserProfile & { id: string }>}
 */
export async function loadUserProfile(userID) {
  const {data} = (await _httpEndpoint({ type: 'loadUserProfile', payload: { userID }}));
  data.id = userID;
  return update(data, {
    'achievements.*': {
      completed: convertStamp,
      updated: convertStamp
    }
  });
}

/**
 * @param {string} userID
 */
export async function mergeWithAccount(userID) {
  await _httpEndpoint({ type: 'mergeWithAccount', payload: { userID }});
}

export async function reportPlog(plogID) {
  return await _httpEndpoint({ type: 'reportPlog', payload: { plogID }});
}

/**
 * @returns {Promise<import('./project/functions/http').RegionInfo>}
 */
export async function getRegionInfo(latitude, longitude) {
  const { data } = await _httpEndpoint({ type: 'getRegionInfo', payload: { latitude, longitude }});
  return data;
}

/**
 * @returns {Promise<import('./project/functions/http').RegionLeaderboard>}
 */
export async function getRegionLeaders(regionID) {
  return (await _httpEndpoint({ type: 'getRegionLeaders', payload: { regionID }})).data;
}

export async function userLinked() {
  await _httpEndpoint({ type: 'userLinked', payload: { } });
}
