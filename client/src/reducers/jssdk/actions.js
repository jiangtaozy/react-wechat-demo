/*
 * Created by jemo on 2018-1-2.
 * redux中jssdk对象action
 */

import axios from '../../utils/axios'

export const UPDATE_JSSDK = 'root/UPDATE_JSSDK'

export function configWechat(config) {
  return (dispatch, getState) => {
    let href = window.location.href.split('#')[0]
    return getJssdkIfNeeded(dispatch, getState, config, href).then(() => {
      let jssdk = getState().jssdk
      let jssdkItem = jssdk[href]
      return configJssdk(jssdkItem).then(() => {
        jssdkItem.shareUrl = config.url // 自定义分享链接
        return configShare(jssdkItem)
      })
    }).catch(error => {
      console.error('configJSSDK error.message: ' + JSON.stringify(error.message))
      console.error('configJSSDK error.response: ' + JSON.stringify(error.response))
    });
  }
}

export function configPay() {
  return (dispatch, getState) => {
    let href = window.location.href.split('#')[0]
    return getJssdkIfNeeded(dispatch, getState, null, href).then(() => {
      let jssdk = getState().jssdk
      let jssdkItem = jssdk[href]
      return configJssdk(jssdkItem)
    }).catch(error => {
      console.error('configPay error: ' + JSON.stringify(error))
    });
  }
}

function getJssdkIfNeeded(dispatch, getState, config, href) {
  config = config || {}
  if(shouldGetJSSDK(href, getState())) {
    return axios.get('/jssdk', {
      params: {
        href: href,
      }
    }).then(response => {
      if(response && response.data && response.data.result === 'ok') {
        let jssdk = {
          ...config,
          ...response.data.data,
        }
        return dispatch(updateJSSDK(href, jssdk))
      } else {
        console.error('response error: ' + JSON.stringify(response))
        return Promise.reject(response)
      }
    })
  } else {
    return Promise.resolve(dispatch(updateJSSDK(href, config)))
  }
}

function shouldGetJSSDK(href, state) {
  let jssdk = state.jssdk
  let jssdkItem = jssdk[href]
  if(!jssdkItem ||
    !jssdkItem.create_at ||
    !jssdkItem.expires_in ||
    isNaN(jssdkItem.create_at) ||
    isNaN(jssdkItem.expires_in) ||
    (new Date().getTime()) > (parseInt(jssdkItem.create_at, 10) + parseInt(jssdkItem.expires_in, 10) * 1000)) {
    return true
  } else {
    return false
  }
}

function updateJSSDK(href, jssdk) {
  return {
    type: UPDATE_JSSDK,
    href: href,
    jssdk: jssdk,
  }
}

function configJssdk(jssdk) {
  return new Promise((resolve, reject) => {
    let wx = window.wx
    let config = {
      debug: false,
      appId: jssdk.appid,
      timestamp: jssdk.timestamp,
      nonceStr: jssdk.noncestr,
      signature: jssdk.signature,
      jsApiList: [
        'onMenuShareTimeline',
        'onMenuShareAppMessage',
        'onMenuShareQQ',
        'onMenuShareWeibo',
        'onMenuShareQZone',
        'chooseWXPay',
      ],
    }
    wx.config(config)
    wx.error(function(error) {
      console.log('wx error: ' + JSON.stringify(error))
    })
    resolve()
  })
}

function configShare(jssdk) {
  let wx = window.wx
  wx.ready(() => {
    // 分享到朋友圈
    wx.onMenuShareTimeline({
      title: jssdk.title,
      link: jssdk.shareUrl || jssdk.idUrl,
      imgUrl: jssdk.image,
    })
    // 分享给朋友
    wx.onMenuShareAppMessage({
      title: jssdk.title,
      desc: jssdk.description,
      link: jssdk.shareUrl || jssdk.idUrl,
      imgUrl: jssdk.image,
    })
    // 分享到QQ
    wx.onMenuShareQQ({
      title: jssdk.title,
      desc: jssdk.description,
      link: jssdk.shareUrl || jssdk.idUrl,
      imgUrl: jssdk.image,
    })
    // 分享到腾讯微博
    wx.onMenuShareWeibo({
      title: jssdk.title,
      desc: jssdk.description,
      link: jssdk.shareUrl || jssdk.idUrl,
      imgUrl: jssdk.image,
    })
    // 分享到QQ控件
    wx.onMenuShareQZone({
      title: jssdk.title,
      desc: jssdk.description,
      link: jssdk.shareUrl || jssdk.idUrl,
      imgUrl: jssdk.image,
    })
  })
}
