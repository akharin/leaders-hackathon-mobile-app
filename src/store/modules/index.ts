import { combineReducers } from "redux";
import auth from "../../reducers/auth";
// import profile from '../../reducers/profile';
// import entities from './entities';
// import settings from './settings';
// import notifications from '../../reducers/notifications';
// import statistics from './statistics';
// import network from '../../reducers/network';

const rootReducer = combineReducers({
  auth,
  // profile,
  // entities,
  // settings,
  // notifications,
  // statistics,
  // network
});

export type IState = ReturnType<typeof rootReducer>;

export default rootReducer;
