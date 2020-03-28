import * as Location from 'expo-location';

import { START_LOCATION_WATCH, LOCATION_CHANGED, STOP_LOCATION_WATCH, SET_CURRENT_USER } from './actionTypes';
import { locationChanged, localPlogsUpdated, gotLocationInfo } from './actions';
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
        } else if (action.type === LOCATION_CHANGED || action.type === SET_CURRENT_USER) {
          const result = next(action);
          const {current, location} = store.getState().users;
          if (location && current) {
            getLocalPlogs(location.latitude, location.longitude).onSnapshot(snapshot => {
              store.dispatch(localPlogsUpdated(snapshot.docs.map(plogDocToState)));
            }, _ => {});

              const middlesexFells = { latitude: 42.437622, longitude: -71.115899};
              Location.reverseGeocodeAsync(location).then(
                locationInfo => {
                  store.dispatch(gotLocationInfo(locationInfo));
                },
                error => {

                }
              );
            }

          return result;
        }

        return next(action);
    };
};
