/**
 * Created by Jemo on 17-11-24.
 */

const OAuth = require('wechat-oauth');
const wechatConfig = require('./wechat_config');
const redisClient = require('./redis_client');

const saveToken = function(openid, token, callback) {
    redisClient.hmset(openid, token, function(err, res) {
        if(err) {
            throw err;
        } else {
            callback();
        }
    });
};

const getToken = function(openid, callback) {
    redisClient.hgetall(openid, function(err, obj) {
        if(err) {
            throw err;
        } else {
            callback(null, obj);
        }
    });
};

const oauthClient = function(hostname) {
    return wechatConfig.get(hostname).then(config => {
        //logger.info('oauthClient wechat config: ', config);
        return new OAuth(config.app_id, config.app_key, getToken, saveToken);
    });
}

module.exports = oauthClient;
