/**
 * Created by Jemo on 17-11-24.
 */
const API = require('wechat-api');
const wechatConfig = require('../middleware/wechat_config');

module.exports = function(req, res, next) {
    const hostname = req.hostname;
    wechatConfig.get(hostname).then(config => {
        logger.info('config: ', config);
        const api = new API(config.app_id, config.app_key);
        const menu = {
            "button": [
                {
                    "type": "view",
                    "name": "商城主页",
                    "url": 'http://' + hostname,
                },
                {
                    "name": "我的名片",
                    "sub_button": [
                        {
                            "type": "click",
                            "name": "会员名片",
                            "key": "vcard_member"
                        },
                        {
                            "type": "click",
                            "name": "分销商名片",
                            "key": "vcard_distributor"
                        },
                        {
                            "type": "click",
                            "name": "代理商名片",
                            "key": "vcard_agent"
                        },
                    ]
                }
            ]
        };
        logger.info('menu: ', menu);
        return new Promise((resolve, reject) => {
            api.createMenu(menu, function (error, result) {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }).then(result => {
        logger.info('result: ', result);
        res.send(result);
    }).catch(error => {
        logger.error('error: ', error);
        next(error);
    });
}
