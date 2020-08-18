import { combineReducers } from "redux";
import log from './plogs';
import users from './users';
import preferences from './preferences';
import ui from './ui';
import tasks from './tasks';

export default combineReducers({
  log,
  users,
  preferences,
  tasks,
  ui,
});
