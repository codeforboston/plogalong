import { rateLimited } from '../util/async';

import { LOAD_HISTORY, LOAD_LOCAL_HISTORY, LOCATION_CHANGED, SET_CURRENT_USER } from './actionTypes';
import { localPlogsUpdated, plogsUpdated } from './actions';
import { getLocalPlogs, plogDocToState, queryUserPlogs } from '../firebase/plogs';


const QUERY_LIMIT = 5;

/** @type {import('redux').Middleware} */
export default store => {
  let unsubscribe, firstPageLoaded, lastPageLoaded, lastDoc, historyLoading,
      localUnsubscribe;

  const runLocalPlogQuery = rateLimited(
    (location) => {
      if (localUnsubscribe)
        localUnsubscribe();

      localUnsubscribe = getLocalPlogs(location.latitude, location.longitude).onSnapshot(snapshot => {
        store.dispatch(localPlogsUpdated(snapshot.docs.map(plogDocToState)));
      }, _ => {});
    }, false, true);

  return next => action => {
    const {type, payload} = action;
    if (type === LOAD_HISTORY && !historyLoading) {
      let query = queryUserPlogs(payload.userID).limit(QUERY_LIMIT);
      if (payload.replace) {
        if (unsubscribe) unsubscribe();

        firstPageLoaded = lastPageLoaded = false;
        historyLoading = true;
        lastDoc = null;
        unsubscribe = query.onSnapshot(({docs}) => {
          store.dispatch(plogsUpdated(docs.map(plogDocToState),
                                      { prepend: firstPageLoaded,
                                        replace: !firstPageLoaded }));
          firstPageLoaded = true;
          lastPageLoaded = docs.length < QUERY_LIMIT;
          lastDoc = docs.length ? docs[docs.length-1] : null;
          historyLoading = false;
        }, err => {
          if (!firstPageLoaded) {
            console.warn(err);
            store.dispatch(plogsUpdated([], { replace: true }));
            firstPageLoaded = true;
            historyLoading = false;
          }
        });
      } else if (!lastPageLoaded) {
        historyLoading = true;
        query.startAfter(lastDoc).get().then(({docs}) => {
          store.dispatch(plogsUpdated(docs.map(plogDocToState)));
          lastPageLoaded = docs.length < QUERY_LIMIT;
          lastDoc = docs.length ? docs[docs.length-1] : null;
          historyLoading = false;
        });
      } else {
        // Swallow the message
        return;
      }
    } else if (type === LOAD_LOCAL_HISTORY) {
    } else if (type === LOCATION_CHANGED || type === SET_CURRENT_USER) {
      const result = next(action);
      const {current, location} = store.getState().users;

      if (location && current) {
        runLocalPlogQuery(location);
      }

      return result;
    }

    return next(action);
  };
};
