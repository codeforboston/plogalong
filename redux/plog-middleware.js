import * as geokit from 'geokit';
import AsyncStorage from '@react-native-community/async-storage';

import { coalesceCalls, rateLimited } from '../util/async';
import { keep } from '../util/iter';
import { updateLocalStorage } from '../util/native';

import { LOAD_HISTORY, LOAD_LOCAL_HISTORY, LOCATION_CHANGED, SET_CURRENT_USER, LOAD_PLOGS, LOCAL_HISTORY_LOADING } from './actionTypes';
import { gotPlogData, localPlogIDs, plogsUpdated } from './actions';
import * as actions from './actions';
import { plogDocToState, queryUserPlogs } from '../firebase/plogs';
import { getRegion } from '../firebase/regions';
import { Plogs } from '../firebase/init';

import { getRegionInfo } from '../firebase/functions';

const QUERY_LIMIT = 5;
const REGION_CACHE_KEY = 'com.plogalong.regionInfoCache';


/** @type {import('redux').Middleware} */
export default store => {
  let unsubscribe, firstPageLoaded, lastPageLoaded, lastDoc, historyLoading,
      userId;
  let shouldLoadLocalHistory = false;

  const dispatchUpdates = coalesceCalls((plogs) => {
    store.dispatch(gotPlogData(plogs));
  }, 100);

  const subscribeToPlogs = (plogIds, plogSubscriptions, removeOld=true) => {
    return new Promise(resolve => {
      const oldIdSet = new Set(plogSubscriptions.keys());
      const remaining = new Set(plogIds);

      const markDone = plogID => {
        if (!remaining.size) return;

        remaining.delete(plogID);
        if (!remaining.size) resolve();
      };

      plogIds.forEach(plogID => {
        if (plogSubscriptions.has(plogID)) {
          oldIdSet.delete(plogID);
          markDone(plogID);
        } else {
          plogSubscriptions.set(
            plogID,
            Plogs.doc(plogID).onSnapshot(snap => {
              try {
                dispatchUpdates(snap.exists ?
                                plogDocToState(snap) :
                                { status: 'deleted', id: snap.id });
                markDone(plogID);
              } catch (error) {
                dispatchUpdates(
                  { id: snap.id, status: 'error', error }
                );
                markDone(plogID);
              }
            }, error => {
              if (remaining.has(plogID)) {
                dispatchUpdates({ id: plogID, status: 'error', error });
                markDone(plogID);
              }
            }));
        }
      });

      if (removeOld) {
        for (const plogId of oldIdSet) {
          const unsubscribe = plogSubscriptions.get(plogId);
          try {
            unsubscribe && unsubscribe();
          } finally {
            plogSubscriptions.delete(plogId);
          }
        }
      }
    });
  };

  // plog ids -> unsubscribe functions
  let plogSubscriptions = new Map();
  let localRegionId;
  let localGeohash;
  const runRegionQuery = rateLimited(async (location) => {
    const geohash = geokit.hash({ lat: location.latitude, lng: location.longitude }, 7);

    if (geohash === localGeohash)
      return;

    store.dispatch({ type: LOCAL_HISTORY_LOADING });
    try {
      localGeohash = geohash;
      let regionInfo;
      try {
        regionInfo = await AsyncStorage.getItem(REGION_CACHE_KEY);
        if (regionInfo) {
          regionInfo = JSON.parse(regionInfo);

          if (!regionInfo.geohashes || !regionInfo.geohashes.includes(localGeohash))
            regionInfo = null;
        }
      } catch (err) {}

      if (!regionInfo) {
        regionInfo = await getRegionInfo(location.latitude, location.longitude);
        AsyncStorage.setItem(REGION_CACHE_KEY, JSON.stringify({
          ...regionInfo,
          geohashes: [localGeohash]
        }));
      }

      let { id } = regionInfo;
      if (localRegionId === id)
        return;

      store.dispatch(actions.setRegion(regionInfo));

      getRegion(id).onSnapshot(snapshot => {
        const regionData = snapshot.data();
        const { recentPlogs: {
          ids: plogIds = [],
          geohashes = []
        } = {} } = regionData || {};

        updateLocalStorage(REGION_CACHE_KEY, cached => {
          cached.geohashes = geohashes;
          return cached;
        });

        store.dispatch(localPlogIDs(plogIds));
        ///
      }, _ => {
      });
    } finally {
    }
  }, 5000);

  return next => action => {
    const {type, payload} = action;
    if (type === SET_CURRENT_USER)
      userId = payload.user ? payload.user.uid : null;

    if (type === LOAD_HISTORY && !historyLoading) {
      let query = queryUserPlogs(userId).limit(QUERY_LIMIT);
      if (payload.replace) {
        if (unsubscribe) unsubscribe();

        firstPageLoaded = lastPageLoaded = false;
        historyLoading = true;
        lastDoc = null;
        unsubscribe = query.onSnapshot(snap => {
          const updated = [], removed = [];
          const {docs} = snap;
          snap.docChanges().forEach(change => {
            if (change.type === 'removed')
              removed.push(change.doc.id);
            else
              updated.push(plogDocToState(change.doc));
          });

          store.dispatch(plogsUpdated(updated,
                                      docs.map(doc => doc.id),
                                      { prepend: firstPageLoaded,
                                        removed }));
          firstPageLoaded = true;
          lastPageLoaded = docs.length < QUERY_LIMIT;
          lastDoc = docs.length ? docs[docs.length-1] : null;
          historyLoading = false;
        }, err => {
          if (!firstPageLoaded) {
            store.dispatch(plogsUpdated([], []));
            firstPageLoaded = true;
            historyLoading = false;
          }
        });
      } else if (!lastPageLoaded) {
        historyLoading = true;
        query.startAfter(lastDoc).get().then(({docs}) => {
          store.dispatch(plogsUpdated(docs.map(plogDocToState), docs.map(doc => doc.id), { append: true }));
          lastPageLoaded = docs.length < QUERY_LIMIT;
          lastDoc = docs.length ? docs[docs.length-1] : null;
          historyLoading = false;
        });
      } else {
        // Swallow the action
        return;
      }
    } else if (type === LOCATION_CHANGED || type === SET_CURRENT_USER || type === LOAD_LOCAL_HISTORY) {
      let result;

      if (type === SET_CURRENT_USER || type === LOCATION_CHANGED)
        result = next(action);
      // else if (type === LOCATION_CHANGED)
      //   result = next(action);
          // location = payload.location;

      let {current, location} = store.getState().users;

      if (type === LOAD_LOCAL_HISTORY) {
        shouldLoadLocalHistory = true;
      }

      if (location && current && shouldLoadLocalHistory) {
        runRegionQuery(location);
      }

      if (result)
        return result;
    } else if (type === SET_CURRENT_USER && !payload.user) {
      store.dispatch(plogsUpdated([]));
    } else if (type === LOAD_PLOGS) {
      const ids = payload.plogIDs.filter(id => !plogSubscriptions.has(id));
      store.dispatch(gotPlogData(ids.map(id => ({ id, status: 'loading' }))));
      subscribeToPlogs(ids, plogSubscriptions);
    }

    return next(action);
  };
};
