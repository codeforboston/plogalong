import {
  LOG_PLOG,
} from './actionTypes';

import { savePlog } from '../firebase/plogs';

export default (store) => (next) => (action) => {
  if (action.type === LOG_PLOG) {
    try {
      savePlog(action.payload);
    }
    catch (ex) {
      console.error(ex);
    }
  }

  return next(action);
};
