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
        return configShare(jssdkItem)
      })
    }).catch(error => {
      console.log('configJSSDK error: ' + JSON.stringify(error)) // 查看请求错误
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
      console.log('configPay error: ' + JSON.stringify(error))
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
        return Promise.reject(response)
        //console.log('response error: ' + JSON.stringify(response))
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
    //console.log('refresh jssdk')
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
  //console.log('configJssdk jssdk: ' + JSON.stringify(jssdk))
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
  console.log('configShare jssdk: ' + JSON.stringify(jssdk))
  let wx = window.wx
  wx.ready(() => {
    // 分享到朋友圈
    wx.onMenuShareTimeline({
      title: jssdk.title,
      link: jssdk.idUrl,
      imgUrl: jssdk.image,
    })
    // 分享给朋友
    wx.onMenuShareAppMessage({
      title: jssdk.title,
      desc: jssdk.description,
      link: jssdk.idUrl,
      imgUrl: jssdk.image,
    })
    // 分享到QQ
    wx.onMenuShareQQ({
      title: jssdk.title,
      desc: jssdk.description,
      link: jssdk.idUrl,
      imgUrl: jssdk.image,
    })
    // 分享到腾讯微博
    wx.onMenuShareWeibo({
      title: jssdk.title,
      desc: jssdk.description,
      link: jssdk.idUrl,
      imgUrl: jssdk.image,
    })
    // 分享到QQ控件
    wx.onMenuShareQZone({
      title: jssdk.title,
      desc: jssdk.description,
      link: jssdk.idUrl,
      imgUrl: jssdk.image,
    })
  })
}
