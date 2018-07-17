/**
 * Created by Jemo on 17-11-20.
 */

const Promise = require('bluebird');
const db = require('../models/db');
const wechatMessage = require('./wechat/wechat_message');

const saveOpenid = function(userInfo) {
    return checkUserInfo(userInfo)
        .then(checkOpenid)
        .then(checkPid)
        .then(save);
}

const checkUserInfo = function(userInfo) {
    if(!userInfo) {
        const error = new Error('null userInfo');
        return Promise.reject(error);
    } else {
        return Promise.resolve(userInfo);
    }
}

const checkOpenid = function(userInfo) {
    logger.info('***check db openid')
    return db['User'].findOne({ where: {
        weixin_openid: userInfo.openid,
        del: false,
    }}).then(user => {
        if(user) {
            userInfo.id = user.id;
            if(user.weixin_nickname != userInfo.nickname ||
              user.weixin_headimgurl != userInfo.headimgurl ||
              user.sex != userInfo.sex ||
              user.weixin_language != userInfo.language ||
              user.weixin_city != userInfo.city ||
              user.weixin_province != userInfo.province ||
              user.weixin_country != userInfo.country ||
              (user.weixin_isfollow != userInfo.weixin_isfollow && userInfo.weixin_isfollow)  // 只有关注时，更新weixin_isfollow
            ) {
                // 用户信息不同时，更新user
                if(user.origin_url) {
                    // origin_url非空时，不更新origin_url
                    userInfo.originUrl = user.origin_url;
                }
                return update(userInfo);
            } else {
                return Promise.resolve(userInfo);
            }
        } else {
            userInfo.id = null;
            return Promise.resolve(userInfo);
        }
    });
};

const checkPid = function(userInfo) {
    if(!userInfo.id && userInfo.pid) {
        logger.info('***check pid')
        return db['User'].findOne({ where: {
            id: userInfo.pid,
        }}).then(user => {
            if(user && user.weixin_openid == userInfo.openid) {
                userInfo.id = user.id;
            }
            if(user && user.weixin_openid != userInfo.openid) {
                userInfo.pid1 = user.id;
                userInfo.pid2 = user.pid1;
                userInfo.pid3 = user.pid2;
                if(user.pids) {
                    userInfo.pids = user.pids + ',' + user.id;
                } else {
                    userInfo.pids = user.id;
                }
            }
            return Promise.resolve(userInfo);
        });
    } else {
        // id存在或pid(即urlId)为空，则无需检查pid
        return Promise.resolve(userInfo);
    }
};

const save = function(userInfo) {
    if(userInfo.id) {
        return Promise.resolve(userInfo);
    }
    logger.info('***save openid')
    const user = {
        weixin_openid: userInfo.openid,
        pid1: userInfo.pid1,
        pid2: userInfo.pid2,
        pid3: userInfo.pid3,
        pids: userInfo.pids || '00000000000',
        origin_url: userInfo.originUrl,
        weixin_nickname: userInfo.nickname,
        sex: userInfo.sex,
        weixin_language: userInfo.language,
        weixin_city: userInfo.city,
        weixin_province: userInfo.province,
        weixin_country: userInfo.country,
        weixin_headimgurl: userInfo.headimgurl,
        weixin_isfollow: userInfo.weixin_isfollow,
    };
    return db['User'].create(user).then(user => {
        user = user.toJSON();
        return wechatMessage.registration(user).then(result => {
            logger.info('wechatMessage.registration result: ', result);
            return Promise.resolve(user);
        });
    });
};

const update = function(userInfo) {
    if(!userInfo) {
        const error = new Error('update-null-userInfo');
        return Promise.reject(error);
    }
    logger.info('***update userInfo')
    const user = {
        origin_url: userInfo.originUrl,
        weixin_nickname: userInfo.nickname,
        sex: userInfo.sex,
        weixin_language: userInfo.language,
        weixin_city: userInfo.city,
        weixin_province: userInfo.province,
        weixin_country: userInfo.country,
        weixin_headimgurl: userInfo.headimgurl,
    };
    if(userInfo.weixin_isfollow) {
        user.weixin_isfollow = userInfo.weixin_isfollow;
    }
    return db['User'].update(user, {
        where: { id: userInfo.id }
    }).then(result => {
        // return Promise.resolve(JSON.parse(JSON.stringify(result)));
        return Promise.resolve(userInfo);
    });
}

module.exports = saveOpenid;
