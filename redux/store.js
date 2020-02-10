import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import rootReducer from './reducers';

import { queryUserPlogs, plogDocToState } from '../firebase/plogs';
import { onAuthStateChanged, getUserData } from '../firebase/auth';
import { auth } from '../firebase/init';

import { fromJS } from "immutable";

import { plogsUpdated, setCurrentUser, gotUserData } from './actions';
import PreferencesMiddleware from './preferences-middleware';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;


export function initializeStore(prefs) {
    const store = createStore(
        rootReducer,
        { preferences: prefs ? fromJS(prefs) : null },
        composeEnhancers(
            applyMiddleware(
                thunk,
                PreferencesMiddleware
            )
        )
    );

    let firstStateChange = true;
    let unsubscribe;

    onAuthStateChanged(
        (user) => {
            if (!user && firstStateChange) {
                // log in anonymously
                auth.signInAnonymously();
            }
            firstStateChange = false;

            if (unsubscribe) unsubscribe();

            unsubscribe = user ? getUserData(user).onSnapshot(snap => {
                const data = snap.data();

                if (data)
                    store.dispatch(gotUserData(user.uid, data));
            }) : null;

            store.dispatch(
                setCurrentUser(
                    user === null ?
                        null :
                        user.toJSON()
                )
            );

            if (user && user.uid) {
                queryUserPlogs(user.uid).onSnapshot(snap => {
                    store.dispatch(plogsUpdated(
                        snap.docs.map(plogDocToState)
                    ));
                });

            } else {
                store.dispatch(plogsUpdated([]));
            }
        }
    );

    return store;
}

export default initializeStore;
