/*
 * Created by jemo on 2017-12-28.
 * 微信access_token
 * access_token是公众号的全局唯一接口调用凭据，
 * 公众号调用各接口时都需使用access_token。
 * 开发者需要进行妥善保存。access_token的存储至少要保留512个字符空间。
 * access_token的有效期目前为2个小时，需定时刷新，
 * 重复获取将导致上次获取的access_token失效。
 */

const requestPromise = require('request-promise');
const wechatConfig = require('./wechat_config');
const redisClient = require('./redis_client');

const url = 'https://api.weixin.qq.com/cgi-bin/token';

// 发起请求获取access_token
const set = function(hostname) {
  return wechatConfig.get(hostname).then(config => {
    let params = {
      grant_type: 'client_credential',
      appid: config.app_id,
      secret: config.app_key,
    }
    let options = {
      uri: url,
      qs: params,
      json: true,
    }
    return requestPromise(options).then(response => {
      // {"access_token":"ACCESS_TOKEN","expires_in":7200}
      // {"errcode":40164,"errmsg":"invalid ip 220.184.205.54, not in whitelist hint: [Jo.qwA08772976]"}
      if(response && response.access_token) {
        let token = response;
        token.create_at = new Date().getTime();
        logger.info('request token: ', token)
        return redisClient.jsonSet(hostname + 'access_token', token);
      } else {
        return Promise.reject(response);
      }
    });
  });
};

// 获取access_token
const get = function(hostname) {
  return redisClient.jsonGet(hostname + 'access_token').then(res => {
    // {"access_token":"ACCESS_TOKEN","expires_in":7200, "create_at": 1514458125548 }
    if(!res || !res.create_at ||
      !res.expires_in || isNaN(res.create_at) ||
      isNaN(res.expires_in) ||
      (new Date().getTime()) > (parseInt(res.create_at) + parseInt(res.expires_in) * 1000)) {
      return set(hostname).then(res => {
        logger.info('refresh access token res.access_token: ', res.access_token)
        return Promise.resolve(res.access_token);
      });
    } else {
      return Promise.resolve(res.access_token);
    }
  });
};

exports.get = get;
