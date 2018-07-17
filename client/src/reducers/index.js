/*
 * Created by jemo on 2018-6-6.
 * reducers
 */

import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import jssdk from './jssdk';

export default combineReducers({
  jssdk: jssdk,
  router: routerReducer,
});
