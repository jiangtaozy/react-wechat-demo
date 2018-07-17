/*
 * Created by jemo on 2017-12-28.
 * 微信JSSDK配置信息
 */

const wechatConfig = require('../middleware/wechat_config');
const wechatOauthJssdk = require('../middleware/wechat_oauth_jssdk');

const get = function(req, res, next) {
    const hostname = req.hostname;
    wechatConfig.get(hostname).then(config => {
        let wxConfig = {
            appid: config.app_id,
            appsecret: config.app_key,
            noncestr: 'U9QPiKjfV8869MmQWRT5du',
        }
        let jssdk = new wechatOauthJssdk(wxConfig);
        let href = req.query.href;
        return jssdk.get(href, req)
    }).then(jssdk => {
        let data = {
            result: 'ok',
            data: jssdk,
        };
        res.send(data);
    }).catch(error => {
        logger.error(error)
        let data = {
            result: 'err',
            message: error,
        };
        res.send(data);
    });
}

exports.get = get;
