/*
 * Created by jemo on 2017-12-28.
 * 微信jsapi_ticket
 * jsapi_ticket是公众号用于调用微信JS接口的临时票据。
 * 正常情况下，jsapi_ticket的有效期为7200秒，通过access_token来获取。
 * 由于获取jsapi_ticket的api调用次数非常有限，
 * 频繁刷新jsapi_ticket会导致api调用受限，影响自身业务，
 * 开发者必须在自己的服务全局缓存jsapi_ticket 。
 */

const requestPromise = require('request-promise');
const redisClient = require('./redis_client');
const accessToken = require('./app_access_token');

const url = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket';

// 发起请求获取jsapi_ticket
const set = function(hostname) {
  return accessToken.get(hostname).then(accessToken => {
    let params = {
      access_token: accessToken,
      type: 'jsapi',
    }
    let options = {
      uri: url,
      qs: params,
      json: true,
    }
    return requestPromise(options).then(response => {
      // {"errcode":41001,"errmsg":"access_token missing hint: [_6H1IA0039vr43!]"}
      if(response && response.errcode === 0) {
        let now = new Date().getTime();
        let ticket = {
          ticket: response.ticket,
          expires_in: response.expires_in,
          create_at: now, 
        };
        logger.info('request jsapi_ticket: ', ticket)
        return redisClient.jsonSet(hostname + 'jsapi_ticket', ticket);
      } else {
        return Promise.reject(response);
      }
    });
  });
};

// 获取jsapi_ticket
const get = function(hostname) {
  return redisClient.jsonGet(hostname + 'jsapi_ticket').then(res => {
    if(!res || !res.create_at ||
      !res.expires_in || isNaN(res.create_at) ||
      isNaN(res.expires_in) ||
      (new Date().getTime()) > (parseInt(res.create_at) + parseInt(res.expires_in) * 1000)) {
      return set(hostname).then(res => {
        logger.info('refresh jsapi ticket res: ', res)
        return Promise.resolve(res);
      });
    } else {
      return Promise.resolve(res);
    }
  });
};

exports.get = get;
