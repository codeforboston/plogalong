import {
  LOG_PLOG,
    SET_CURRENT_USER
} from './actionTypes';

import { savePlog } from '../firebase/plogs';
import { saveUser } from '../firebase/auth';

export default (store) => (next) => (action) => {
  if (action.type === LOG_PLOG) {
    try {
        savePlog({...action.payload, userID: store.getState().users.getIn(['current', 'uid'])});
    }
    catch (ex) {
      console.error(ex);
    }
  } else if (action.type === SET_CURRENT_USER) {
      const {user} = action.payload;
      if (user)
          saveUser(user);
  }

  return next(action);
};
