/*
 * Created by jemo on 2017-12-28.
 * 获取JSSDK配置信息
 * 参考于：https://github.com/cy08/wechatOauthJSSDk
 */

//const config = require('../config/config');
const controllerApiUser = require('../controller/controller_api_user');

let crypto = require('crypto'), //加密模块
    request = require('request'); //异步请求模块
const jsapiTicket = require('./jsapi_ticket');
const redisClient = require('./redis_client');

let sha1 = (str) => {
    var md5sum = crypto.createHash('sha1');
    md5sum.update(str, 'utf8');
    str = md5sum.digest('hex');
    return str;
}

function wechatOauthJSSDk(opts) {
    this.appid = opts.appid;
    this.appsecret = opts.appsecret;
    this.noncestr = opts.noncestr || 'U9QPiKjfV8869MmQWRT5du';
}

wechatOauthJSSDk.prototype.set = function(url, req) {
  let noncestr = this.noncestr,
      appid = this.appid,
      appsecret = this.appsecret,
      timestamp = Math.floor(Date.now() / 1000); //精确到秒
  const hostname = req.hostname;
  return jsapiTicket.get(hostname).then(jsapi_ticket => {
    // jsapi_ticket: {
    //   ticket: 'TICKET',
    //   create_at: 'CREATE_AT',
    //   expires_in: 'EXPIRES_in',
    // }
    let signature = sha1('jsapi_ticket=' + jsapi_ticket.ticket + '&noncestr=' + noncestr + '&timestamp=' + timestamp + '&url=' + url);
    return controllerApiUser.getPromise(req).then(user => {
      if(!user) {
        return Promise.reject('user is null')
      }
      let id = user.id
      let idUrl
      let idRegex = /(\?|\&)id=[^&]+/
      if(idRegex.test(url)) {
        idUrl = url.replace(/\?id=[^&]+/, '?id=' + id)
        idUrl = idUrl.replace(/\&id=[^&]+/, '&id=' + id)
      } else if(url.indexOf('?') === -1) {
        idUrl = url + '?id=' + id
      } else {
        idUrl = url + '&id=' + id
      }
      let jssdk = {
        url: url,
        idUrl: idUrl,
        appid,
        noncestr,
        timestamp,
        signature,
        create_at: jsapi_ticket.create_at,
        expires_in: jsapi_ticket.expires_in,
      };
      return redisClient.jsonSet(url + 'jssdk', jssdk);
    })
  });
}

wechatOauthJSSDk.prototype.get = function(url, req) {
  return redisClient.jsonGet(url + 'jssdk').then(res => {
    if(!res || !res.create_at ||
      !res.expires_in || isNaN(res.create_at) ||
      isNaN(res.expires_in) ||
      (new Date().getTime()) > (parseInt(res.create_at) + parseInt(res.expires_in) * 1000)) {
      return this.set(url, req).then(res => {
        logger.info('refresh jssdk: ', res)
        return Promise.resolve(res);
      });
    } else {
      return Promise.resolve(res);
    }
  });
}

module.exports = wechatOauthJSSDk;
