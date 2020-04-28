import { combineReducers } from "redux";
import log from './plogs';
import users from './users';
import preferences from './preferences';
import ui from './ui';

export default combineReducers({
  log,
  users,
  preferences,
  ui,
});
