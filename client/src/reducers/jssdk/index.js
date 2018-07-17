/*
 * Created by jemo on 2018-1-2.
 * redux中jssdk对象，包含微信jssdk配置信息
 * jssdk: {
 *   [href]: {
 *     title: 'title',
 *     description: 'description',
 *     image: 'image',
 *     url: 'url',
 *     appid: 'appid',
 *     noncestr: 'noncestr',
 *     timestamp: 'timestamp',
 *     signature: 'signature',
 *     create_at: 'create_at',
 *     expires_in: 'expires_in',
 *   },
 * }
 */

import { UPDATE_JSSDK } from './actions'

// Reducer
const JSSDKReducer = (state = {}, action) => {
  switch(action.type) {
    case UPDATE_JSSDK:
      console.log('action: ' + JSON.stringify(action))
      return {
        ...state,
        [action.href]: {
          ...state[action.href],
          ...action.jssdk,
        },
      }
    default:
      return state
  }
}

export default JSSDKReducer
