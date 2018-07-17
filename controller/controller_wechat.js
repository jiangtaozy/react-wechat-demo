/**
 * Created by Jemo on 17-11-2.
 * 处理用户消息和开发者需要的事件推送
 */

const wechat = require('wechat');
const getUserInfo = require('../middleware/get_user_info');
const saveOpenid = require('../middleware/save_openid');
const { User } = require('../models/db');
//const WxMenuCustom = require('../models/WxMenuCustom');
const wechatConfig = require('../middleware/wechat_config');
const wechatMessage = require('../middleware/wechat/wechat_message');

module.exports = function(req, res, next) {
    let hostname = req.hostname;
    wechatConfig.get(hostname).then(config => {
        const configData = {
            token: config.token,
            appid: config.app_id,
            encodingAESKey: config.encoding_aes_key,
        };
        wechat(configData, function(req, res, next) {
            // 微信输入信息都在req.weixin上
            let message = req.weixin;
            logger.info('message: ', message);
            if(message && message.MsgType == 'event' && message.Event == 'subscribe') {
                // 关注公众号事件   
                let userInfo = {
                    openid: message.FromUserName,
                    weixin_isfollow: true
                };
                saveOpenid(userInfo).then(function(newUser) {
                    res.send('');
                }).catch(function(error) {
                    res.send('');
                });
            } else if(message && message.MsgType == 'event' && message.Event == 'unsubscribe') {
                // 取消关注公众号事件   
                const user = {
                    weixin_isfollow: false
                };
                User.update(user, {
                    where: { weixin_openid: message.FromUserName }
                }).then(result => {
                });
                res.send('');
            } else if(message && message.Event == 'CLICK' && message.EventKey.indexOf('vcard_') == 0) {
                // 会员名片、分销名片、代理名片
                /*
                message:  { ToUserName: 'gh_14f783414e16',
                  FromUserName: 'oIPhb0UTUDakjefaZPx0A_-SC_C4',
                  CreateTime: '1518225265',
                  MsgType: 'event',
                  Event: 'CLICK',
                  EventKey: 'vcard_member' }
                */
                let openid = message.FromUserName;
                let type = message.EventKey.substring(6);
                wechatMessage.vcardClick(openid, type).then(data => {
                    //logger.info('data: ', data);
                    res.reply(data);
                }).catch(err => {
                    logger.error(err);
                    res.send(err.message);
                });
            } else if(message && message.Event == 'CLICK' && message.EventKey.indexOf('custom_message#') == 0) {
                /*
                User.findOne({
                    attributes: [
                        'kehu_id',
                    ],
                    where: {
                        weixin_openid: message.FromUserName,
                        del: false,
                    },
                    raw: true,
                }).then(user => {
                    //logger.info('user: ', user);
                    // todo
                    return
                    /*
                    return WxMenuCustom.findOne({
                        attributes: [
                            'custom_message',
                        ],
                        where: {
                            kehu_id: user.kehu_id,
                            del: false,
                        },
                        raw: true,
                    }).then(menu => {
                        //logger.info('menu: ', menu);
                        let customMessage = JSON.parse(menu.custom_message);
                        let eventKey = message.EventKey;
                        let messageKey = '#' + eventKey.split('#')[1];
                        //logger.info('messageKey: ', messageKey);
                        let msg = customMessage[messageKey];
                        //logger.info('msg: ', msg);
                        res.reply(msg);
                    });
                });
                */
            } else {
                res.reply('您好, 感谢您的关注');
                //res.reply('<a href="https://www.w3schools.com">Visit W3Schools.com!</a>');
                /*
                let news = [
                    {
                        title: '标题',
                        description: '描述描述描述描述描述描述',
                        picurl: 'https://www.codeproject.com/KB/GDI-plus/ImageProcessing3/scr1.jpg',
                        url: 'https://goss4.vcg.com/creative/vcg/800/version23/VCG21gic13680368.jpg',
                    }
                ]
                res.reply(news);
                */
            }
        })(req, res, next);
    }).catch(error => {
        next(error);
    });
}
