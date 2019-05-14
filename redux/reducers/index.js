import { combineReducers } from "redux";

import log from './plogs';

import users from './users';

export default combineReducers({
  log,
  users,
});
