import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import rootReducer from './reducers';

import { onAuthStateChanged, getUserData } from '../firebase/auth';

import { setCurrentUser, gotUserData, loginAnonymously, flashMessage } from './actions';
import PreferencesMiddleware from './preferences-middleware';
import LocationMiddleware from './location-middleware';
import PlogMiddleware from './plog-middleware';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;


export function initializeStore(prefs) {
    const store = createStore(
        rootReducer,
        { preferences: prefs },
        composeEnhancers(
            applyMiddleware(
                thunk,
                PreferencesMiddleware,
                LocationMiddleware,
                PlogMiddleware
            )
        )
    );

    let firstStateChange = true;
    let lastUID;

    onAuthStateChanged(
        (user) => {
            if (!user && firstStateChange) {
                // log in anonymously
              store.dispatch(loginAnonymously(true));
            }
            firstStateChange = false;

            store.dispatch(
                setCurrentUser(
                    user === null ?
                        null :
                        user.toJSON()
                )
            );

            if (user && user.uid !== lastUID) {
              if (!user.isAnonymous) {
                store.dispatch(flashMessage('Welcome back!'));
              }
                // Firebase will automatically unsubscribe from snapshot updates
                // on error.
              getUserData(user, store).then(userDoc => userDoc.onSnapshot(snap => {
                const data = Object.assign(snap.data(), { updated: Date.now() });

                if (data) {
                  store.dispatch(gotUserData(user.uid, data));
                }
              }, _ => {}));
            }

          lastUID = user && user.uid;
        }
    );

    return store;
}

export default initializeStore;
