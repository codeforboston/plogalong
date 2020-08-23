import * as types from './actionTypes';
import * as actions from './actions';
import { auth } from '../firebase/init';
import { onAuthStateChanged, getUserData } from '../firebase/auth';


/** @type {import('redux').Middleware} */
export default store => {
  let lastUID;

  onAuthStateChanged(
    user => {
      store.dispatch(
        actions.setCurrentUser(
          user === null ?
            null :
            user.toJSON()));

      if (user && user.uid !== lastUID) {
        if (!user.isAnonymous) {
          store.dispatch(actions.flashMessage('Welcome back!'));
        }
        // Firebase will automatically unsubscribe from snapshot updates
        // on error.
        getUserData(user, store).then(userDoc => userDoc.onSnapshot(snap => {
          const data = Object.assign(snap.data(), { updated: Date.now() });

          if (data) {
            store.dispatch(actions.gotUserData(user.uid, data));
          }
        }, _ => {}));
      }

      lastUID = user && user.uid;
    }
  );

  return next => action => {
    return next(action);
  };
};
