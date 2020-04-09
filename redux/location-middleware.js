import * as Location from 'expo-location';

import { rateLimited } from '../util/async';

import { START_LOCATION_WATCH, LOCATION_CHANGED, STOP_LOCATION_WATCH, SET_CURRENT_USER } from './actionTypes';
import { locationChanged, gotLocationInfo, locationError } from './actions';


const reverseGeocode = rateLimited(Location.reverseGeocodeAsync, 10000);

/** @type {import('redux').Middleware} */
export default store => {
  let stopWatching;

  return next => action => {
    if (action.type === LOCATION_CHANGED || action.type === SET_CURRENT_USER) {
      const result = next(action);
      const {current, location} = store.getState().users;
      if (location && current) {
        reverseGeocode(location).then(
          locationInfo => {
            store.dispatch(gotLocationInfo(locationInfo));
          },
          error => {

          }
        );
      }

      return result;
    }

    if (action.type === START_LOCATION_WATCH) {
      if (stopWatching && typeof stopWatching === 'function') stopWatching();
      Location.getCurrentPositionAsync({}).then(location => {
          store.dispatch(
            location ?
              locationChanged(location.coords)
              : locationError({ message: "We couldn't identify where you are!",
                                code: 'location-not-found' }));
      }, err => {
        store.dispatch(locationError(err));
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
    } 

    return next(action);
  };
};
