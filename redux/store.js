import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import rootReducer from './reducers';

import { getLocalPlogs, getPlogs } from '../firebase/plogs';
import { onAuthStateChanged } from '../firebase/auth';

import { fromJS } from "immutable";

import { updatePlogs, setCurrentUser } from './actions';
import FirebaseMiddleware from './firebase-middleware';
import PreferencesMiddleware from './preferences-middleware';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;


export function initializeStore(prefs) {
    const store = createStore(
        rootReducer,
        { preferences: prefs ? fromJS(prefs) : null },
        composeEnhancers(
            applyMiddleware(
                FirebaseMiddleware,
                thunk,
                PreferencesMiddleware
            )
        )
    );

    // TODO
    // getLocalPlogs().then(
    //     (plogs) => {
    //         store.dispatch(
    //             updatePlogs(plogs)
    //         );
    //     }
    // );

    onAuthStateChanged(
        (user) => {
            // console.log('user', user);

            store.dispatch(
                setCurrentUser(
                    user === null ?
                        null :
                        user.toJSON()
                )
            );

            if (user) {
                getPlogs(user.uid).then(plogs => {
                    store.dispatch(updatePlogs(plogs));
                });
            }
        }
    );

    return store;
}

export default initializeStore;
