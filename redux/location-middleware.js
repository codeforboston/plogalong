import * as Location from 'expo-location';

import { START_LOCATION_WATCH, LOCATION_CHANGED, STOP_LOCATION_WATCH } from './actionTypes';
import { locationChanged, localPlogsUpdated } from './actions';
import { getLocalPlogs, plogDocToState } from '../firebase/plogs';

/** @type {import('redux').Middleware} */
export default store => {
    let stopWatching;

    return next => action => {
        if (action.type === START_LOCATION_WATCH) {
            if (stopWatching && typeof stopWatching === 'function') stopWatching();
            Location.getCurrentPositionAsync({}).then(location => {
                if (location)
                    store.dispatch(locationChanged(location.coords));
                // TODO Location error
            });

            stopWatching = Location.watchPositionAsync({
                enableHighAccuracy: true,
                accuracy: 4,
                timeInterval: 500,
            }, location => {
                store.dispatch(locationChanged(location && location.coords));
            });
        } else if (action.type === STOP_LOCATION_WATCH) {
            if (stopWatching) stopWatching();
            stopWatching = null;
        } else if (action.type === LOCATION_CHANGED) {
            const {payload: {location}} = action;
            if (location) {
                getLocalPlogs(location.latitude, location.longitude).onSnapshot(snapshot => {
                    store.dispatch(localPlogsUpdated(snapshot.docs.map(plogDocToState)));
                }, console.warn);
            }
        }

        return next(action);
    };
};
