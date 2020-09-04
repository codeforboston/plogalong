import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import rootReducer from './reducers';

import AuthMiddleware from './auth-middleware';
import PreferencesMiddleware from './preferences-middleware';
import LocationMiddleware from './location-middleware';
import PlogMiddleware from './plog-middleware';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;


export function initializeStore(initialPrefs) {
  return createStore(
    rootReducer,
    { preferences: initialPrefs },
    composeEnhancers(
      applyMiddleware(
        thunk,
        AuthMiddleware,
        PreferencesMiddleware,
        LocationMiddleware,
        PlogMiddleware
      )
    )
  );
}

export default initializeStore;
