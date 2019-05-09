// import { createStore } from 'react-redux';
import { createStore, compose, applyMiddleware } from 'redux';
import rootReducer from './reducers';

import { getPlogs } from '../firebase/plogs';

import { updatePlogs } from './actions';
import FirebaseMiddleware from './firebase-middleware';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  rootReducer,
  composeEnhancers(
    applyMiddleware(
      FirebaseMiddleware
    )
  )
);

getPlogs().then(
  (plogs) => {
    store.dispatch(
      updatePlogs(plogs)
    )
  }
);

export default store;
