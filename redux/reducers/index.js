import { combineReducers } from "redux";
import log from './plogs';
import users from './users';
import preferences from './preferences';

export default combineReducers({
  log,
  users,
  preferences,
});
