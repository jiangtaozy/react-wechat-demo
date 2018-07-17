/*
 * Created by jemo on 2018-2-7.
 * 微信消息中间件。
 */

const Promise = require('bluebird');
const API = require('wechat-api');
const wechatConfig = require('../wechat_config');
const db = require('../../models/db');
//const LevelMember = require('../../models/UserLevel');
//const LevelFxs = require('../../models/FxsLevel');
//const EShop = require('../../models/EShop');
//const VCardModel = require('../../models/VCard');
const vcardMiddleware = require('../vcard');
const path = require('path');

exports.registration = registration;
//exports.vcardClick = vcardClick;

function registration(user) {
    if(!user) {
        return Promise.reject(new Error('user is ' + user));
    }
    return wechatConfig.get(user.kehu_domain).then(config => {
        //logger.info('config: ', config);
        const api = new API(config.app_id, config.app_key);
        return db['User'].count({
            where: {
                del: false,
            },
        }).then(count => {
            let message = user.weixin_nickname + '小主, 恭喜您成为' +
                config.gzh_name + '的第' + count + '位会员!';
            logger.info('message: ', message);
            return new Promise((resolve, reject) => {
                api.sendText(user.weixin_openid, message, function (error, result) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
            });
        });
    });
}

function vcardClick(openid, type) {
    if(!openid) {
        return Promise.reject(new Error('openid is ' + openid));
    }
    return db['User'].findOne({
        attributes: ['id', 'weixin_openid', 'weixin', 'weixin_nickname',
            'role', 'level_member', 'level_fxs', 'weixin_headimgurl'],
        where: {
            weixin_openid: openid,
            del: false,
        },
        include: [
            {
                model: db['UserLevel'],
                attributes: ['id', 'name'],
                as: 'level_member',
                //where: {
                //    del: false,
                //},
            },
            {
                model: db['FxsLevel'],
                attributes: ['id', 'name'],
                as: 'fxs_level_commission',
                //where: {
                //    del: false,
                //},
            },
            /*
            {
                model: EShop,
                attributes: ['id', 'supplier_id', 'name'],
                as: 'eshop',
                //where: {
                //    supplier_id: '00000000-0000-0000-0000-000000000000',
                //    del: false,
                //},
            },
            */
        ],
    }).then(user => {
        user = JSON.parse(JSON.stringify(user));
        logger.info('user: ', user);
        /*
        user = {
            id: 10000000005,
            weixin_openid: 'oIPhb0UTUDakjefaZPx0A_-SC_C4',
            weixin: null,
            weixin_nickname: '江涛',
            role: '0,3,1',
            level_id1: '1',
            level_id2: '1',
            level_id4: '3',
            weixin_headimgurl: 'http://wx.qlogo.cn/mmopen/vi_32/xWnqaSB8R7VIBugWZjWoge03K7oAl2XYsybhfdwlMgrOricvUKaWh3xkSDm4s9UCRB7V7eGMfx2DSypbYMbpEfg/132',
            kehu_id: 'f9bb46c6-48e2-45cd-afd6-74afe9cc9c6f',
            kehu_domain: 'localhost:3001',
            level_member: { id: 1, name: '金牌会员' },
            fxs_level_commission: { id: 1, name: '金牌分销商' },
            eshop: {
                id: 1,
                kehu_id: 'f9bb46c6-48e2-45cd-afd6-74afe9cc9c6f',
                supplier_id: '00000000-0000-0000-0000-000000000000',
                name: '乐正商城'
            }
        }
        */
        if(!user) {
            return Promise.reject(new Error('user info is ' + user + ', openid: ' + openid));
        }
        if(type == 'member') {
            let levelMember = user.level_member || {};
            // logger.info('levelMember: ', levelMember);
            user.level = levelMember.name || '会员';
            // logger.info('user.level: ', user.level);
        } else if(type == 'distributor') {
            if(user.role.indexOf('1') == -1) {
                return Promise.resolve('您还不是分销商');
            }
            let fxsLevel = user.fxs_level_commission || {};
            // logger.info('fxsLevel: ', fxsLevel);
            user.level = fxsLevel.name || '分销商';
            // logger.info('user.level: ', user.level);
        } else if(type == 'agent') {
            if(user.role.indexOf('3') == -1) {
                return Promise.resolve('您还不是代理商');
            }
            if(user.level_id4 == '1') {
                user.level = '一级';
            } else if(user.level_id4 == '2') {
                user.level = '二级';
            } else if(user.level_id4 == '3') {
                user.level = '三级';
            }
            if(user.level && user.dls_is_area) {
                user.level += '区域';
            }
            if(user.level) { 
                user.level += '代理商';
            }
        }
        user.eshop = user.eshop || {};
        // logger.info('user: ', user);
        return;
        // todo
        /*
        return VCardModel.findOne({
            attributes: ['id',
                'name_color', 'name_px', 'name_py', 'name_font_size', 'name_font', 'name_display',
                'wxh_color', 'wxh_px', 'wxh_py', 'wxh_font_size', 'wxh_font', 'wxh_display',
                'level_color', 'level_px', 'level_py', 'level_font_size', 'level_font', 'level_display',
                'sqdw_color', 'sqdw_px', 'sqdw_py', 'sqdw_font_size', 'sqdw_font', 'sqdw_display',
                'logo_size', 'logo_px', 'logo_py', 'logo_display', 'logo_radius',
                'qrcode_size', 'qrcode_px', 'qrcode_py', 'qrcode_display',
                'bg', 'vcard_type'],
            where: {
                kehu_id: user.kehu_id,
                vcard_type: type,
                del: false,
            },
            raw: true,
        }).then(vcardInfo => {
            //logger.info('vcardInfo: ', vcardInfo);
            if(vcardInfo && vcardInfo.name_font == '1') {
                vcardInfo.name_font = '逐浪粗隶书法体.otf';
            } else if(vcardInfo && vcardInfo.name_font == '2') {
                vcardInfo.name_font = '肥肥扭扭体.ttf';
            }
            if(vcardInfo && vcardInfo.wxh_font == '1') {
                vcardInfo.wxh_font = '逐浪粗隶书法体.otf';
            } else if(vcardInfo && vcardInfo.wxh_font == '2') {
                vcardInfo.wxh_font = '肥肥扭扭体.ttf';
            }
            if(vcardInfo && vcardInfo.level_font == '1') {
                vcardInfo.level_font = '逐浪粗隶书法体.otf';
            } else if(vcardInfo && vcardInfo.level_font == '2') {
                vcardInfo.level_font = '肥肥扭扭体.ttf';
            }
            if(vcardInfo && vcardInfo.sqdw_font == '1') {
                vcardInfo.sqdw_font = '逐浪粗隶书法体.otf';
            } else if(vcardInfo && vcardInfo.sqdw_font == '2') {
                vcardInfo.sqdw_font = '肥肥扭扭体.ttf';
            }
            return Promise.resolve({user, vcardInfo});
        }).then(({user, vcardInfo}) => {
            let qrcodeUrl = 'http://' + user.kehu_domain + '?id=' + user.id;
            let defaultBgUrl = 'http://img.chslab.com:8780/img/HJwBC4YLM.png';
            //logger.info('qrcodeUrl: ', qrcodeUrl);
            return vcardMiddleware.generateVCard(defaultBgUrl, user.weixin_headimgurl, qrcodeUrl,
                    user.weixin_nickname, user.weixin, user.level, user.eshop.name, vcardInfo).then(vcardName => {
                //logger.info('vcardName: ', vcardName);
                //logger.info('user.kehu_domain: ', user.kehu_domain);
                //return Promise.resolve(vcardName); // test
                return wechatConfig.get(user.kehu_domain).then(config => {
                    //logger.info('config: ', config);
                    const api = new API(config.app_id, config.app_key);
                    return new Promise((resolve, reject) => {
                        let vcardFilePath = path.resolve(__dirname, '../vcard/tem', vcardName);
                        //logger.info('vcardFilePath: ', vcardFilePath);
                        api.uploadMedia(vcardFilePath, 'image', function (error, media) {
                            //logger.info('error: ', error);
                            //logger.info('media: ', media);
                            // {"type":"TYPE","media_id":"MEDIA_ID","created_at":123456789}
                            if (error) {
                                reject(error);
                            } else {
                                vcardMiddleware.deleteTemImg(vcardFilePath);
                                let data = {
                                    type: media.type,
                                    content: {
                                        mediaId: media.media_id,
                                    }
                                }
                                resolve(data);
                            }
                        });
                    });
                });
            });
        });
        */
    });
}
