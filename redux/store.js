import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import rootReducer from './reducers';

import { queryUserPlogs, plogDocToState } from '../firebase/plogs';
import { onAuthStateChanged, getUserData } from '../firebase/auth';

import { plogsUpdated, setCurrentUser, gotUserData, loginAnonymously, flashMessage } from './actions';
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

            if (user && user.uid) {
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

                queryUserPlogs(user.uid).onSnapshot(snap => {
                    store.dispatch(plogsUpdated(
                        snap.docs.map(plogDocToState)
                    ));
                }, _ => {});
            } else {
                store.dispatch(plogsUpdated([]));
            }
        }
    );

    return store;
}

export default initializeStore;
