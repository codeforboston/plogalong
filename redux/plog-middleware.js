import { rateLimited } from '../util/async';

import { LOAD_HISTORY, LOAD_LOCAL_HISTORY, LOCATION_CHANGED, SET_CURRENT_USER } from './actionTypes';
import { localPlogsUpdated, plogsUpdated } from './actions';
import { getRegion } from '../firebase/regions';

import { getRegionInfo } from '../firebase/functions';

const QUERY_LIMIT = 5;


/** @type {import('redux').Middleware} */
export default store => {
  let unsubscribe, firstPageLoaded, lastPageLoaded, lastDoc, historyLoading,
      localUnsubscribe;
  let shouldLoadLocalHistory = false, runningLocalPlogQuery = false;

  let plogListUnsubscribe;
  const subscribeToPlogs = (plogIds) => {
    if (plogListUnsubscribe) plogListUnsubscribe();

    if (!plogIds.length) {
      store.dispatch(localPlogsUpdated([], []));
      return;
    }

    plogListUnsubscribe = getPlogsById(plogIds).onSnapshot(plogSnaps => {
      store.dispatch(localPlogsUpdated(plogSnaps.docs.map(plogDocToState), plogIds));
    }, console.warn);
  };

  const runLocalPlogQuery = rateLimited(
    async (location) => {
      if (localUnsubscribe)
        localUnsubscribe();

      if (runningLocalPlogQuery)
        return;

      runningLocalPlogQuery = true;

      try {
        const { id } = await getRegionInfo(location.latitude, location.longitude);
        localUnsubscribe = getRegion(id).onSnapshot(snapshot => {
          const plogIds = snapshot.data().recentPlogs.map(plog => plog.id);

          subscribeToPlogs(plogIds);
        }, _ => {
          subscribeToPlogs([]);
          localUnsubscribe = null;
        });
      } finally {
        runningLocalPlogQuery = false;
      }
    }, 60000);

  return next => action => {
    const {type, payload} = action;
    if (type === LOAD_HISTORY && !historyLoading) {
      let query = queryUserPlogs(payload.userID).limit(QUERY_LIMIT);
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
            console.warn(err);
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
        // Swallow the message
        return;
      }
    } else if (type === LOCATION_CHANGED || type === SET_CURRENT_USER || type === LOAD_LOCAL_HISTORY) {
      const result = next(action);
      const {current, location} = store.getState().users;

      if (type === LOAD_LOCAL_HISTORY)
        shouldLoadLocalHistory = true;

      if (location && current && shouldLoadLocalHistory) {
        runLocalPlogQuery(location);
      }

      return result;
    } else if (type === SET_CURRENT_USER && !action.payload.user) {
      store.dispatch(plogsUpdated([]));
    }

    return next(action);
  };
};
