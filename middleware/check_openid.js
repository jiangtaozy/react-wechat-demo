/**
 * Created by Jemo on 17-10-30.
 */

const OAuth = require('wechat-oauth');
const saveOpenid = require('./save_openid');
const getAccessToken = require('./get_access_token');
const getUserInfo = require('./get_user_info');
const wechatConfig = require('./wechat_config');

const checkOpenid = function (req, res, next) {
    const hostname = req.hostname;
    const originUrl = req.protocol + '://' + hostname + req.originalUrl;
    const wechatAccessToken = req.session.wechatAccessToken;
    const wechatUserInfo = req.session.wechatUserInfo;
    const code = req.query.code;
    logger.info('-----------> originUrl : ', originUrl);
    if(isWechatServerOrStaticFile(req.path)) {
        // 如果是微信服务器请求或请求js静态文件，则不再check openid
        return next();
    }
    logger.info('req.session.wechatUserInfo: ', req.session.wechatUserInfo);
    /*
    req.session.wechatUserInfo =  { // test 测试用
        openid: 'oIPhb0UTUDakjefaZPx0A_-SC_C4',
        nickname: '江涛zy1',
        sex: 1,
        language: 'zh_CN',
        city: 'Baoding',
        province: 'Hebei',
        country: 'China',
        headimgurl: 'http://wx.qlogo.cn/mmopen/vi_32/xWnqaSB8R7VIBugWZjWoge03K7oAl2XYsybhfdwlMgrOricvUKaWh3xkSDm4s9UCRB7V7eGMfx2DSypbYMbpEfg/132',
        privilege: [],
        originUrl: 'http://hashuo.chslab.com/',
        id: 10000000003,
        kehu_id: '0e4d72b6-39ac-4317-b23a-2dd1034a94fa',
        kehu_domain: 'hashuo.chslab.com',
    }
    */
    /*
    let userInfo =  { // test 测试用
        openid: 'oIPhb0UTUDakjefaZPx0A_-SC_C4',
        nickname: '江涛zy1',
        sex: 1,
        language: 'zh_CN',
        city: 'Baoding',
        province: 'Hebei',
        country: 'China',
        headimgurl: 'http://wx.qlogo.cn/mmopen/vi_32/xWnqaSB8R7VIBugWZjWoge03K7oAl2XYsybhfdwlMgrOricvUKaWh3xkSDm4s9UCRB7V7eGMfx2DSypbYMbpEfg/132',
        privilege: [],
        originUrl: 'http://hashuo.chslab.com/',
        id: 10000000003,
        kehu_id: '0e4d72b6-39ac-4317-b23a-2dd1034a94fa',
        kehu_domain: 'hashuo.chslab.com',
    }
    return saveOpenid(userInfo);
    */
    logger.info('req.session.wechatConfig: ', req.session.wechatConfig);
    /*
    req.session.wechatConfig =  { // test 测试用
        uid: '0e4d72b6-39ac-4317-b23a-2dd1034a94fa',
        token: 'jjyyfuck',
        encoding_aes_key: 'gNTOVV2lftjYqAXImoAHrzjXt13Bn4lvjijET4iBmVu',
        app_id: 'wx8d8e2dd3ce250894',
        app_key: 'aa1c0018359d3cac885b6419fd31a486',
        kehu_domain: 'hashuo.chslab.com',
        create_at: '1517539738839',
        expires_in: '86400000'
    }
    */
    if (!wechatAccessToken && !code) {
        // 跳转微信服务器，获取code
        logger.info('***get code')
        const state = "1";
        const scope = 'snsapi_userinfo';
        // const scope = 'snsapi_base';
        wechatConfig.get(hostname).then(config => {
            logger.info('wechat config: ', config);
            req.session.wechatConfig = config;
            const client = new OAuth(config.app_id, config.app_key);
            const url = client.getAuthorizeURL(originUrl, state, scope);
            logger.info('url: ', url);
            res.redirect(url);
        });
    } else if (!wechatAccessToken && code) {
        // 根据code获取accessToken与用户信息
        logger.info('***get wechatAccessToken');
        getAccessToken(hostname, code).then(accessToken => {
            //logger.info('accessToken: ', accessToken);
            return getUserInfo(hostname, accessToken);
        }).then(function (data) {
            //logger.info('data: ', data);
            req.session.wechatAccessToken = data.accessToken;
            let userInfo = data.userInfo;
            req.session.wechatUserInfo = userInfo;
            userInfo.pid = req.query.id;
            userInfo.originUrl = removeCode(originUrl);
            return saveOpenid(userInfo);
        }).then(function(newUser) {
            req.session.wechatUserInfo.id = newUser.id;
            res.redirect(removeCode(originUrl));
        }).catch(function (err) {
            logger.info('error: ', err);
            next();
        });
    } else {
        next();
    }
};

// 过滤微信服务器、静态文件、api等
const isWechatServerOrStaticFile = function(path) {
    // 配置微信网页授权域名
    // http://example.com/MP_verify_mwTN1uvgPMv6HXzM.txt
    const wechatAuthRegex = /\/MP_verify_\w+.txt/g;
    // 微信api
    // http://example.com/api
    const wechatApiRegex = /\/api(\/(\S+)?)?/g;
    // static/icon/image静态文件
    // http://example.com/static/js/main.9cf9ac.js
    // http://example.com/image/lake.png
    // http://example.com/icon/lake.png
    const staticFileRegex = /\/(static|image|icon)(\/(\S+)?)?/g;
    // favicon.ico文件
    // http://example.com/favicon.ico
    const faviconIcoRegex = /\/favicon.ico/g;
    // alipay
    // http://example.com/pay.htm?goto=*
    // http://example.com/ap.js
    const alipayRegex = /\/(ap.js|pay.htm)(\?\S+)?/g;
    const socketRegex = /\/socket.io(\/(\S+)?)?/g;
    return wechatAuthRegex.test(path) ||
      wechatApiRegex.test(path) ||
      staticFileRegex.test(path) ||
      faviconIcoRegex.test(path) ||
      alipayRegex.test(path) ||
      socketRegex.test(path);
}

// 删除url中code和state
const removeCode = function(originUrl) {
    if(typeof originUrl !== 'string') {
        return originUrl;
    }
    let newUrl;
    newUrl = originUrl.replace(/\?code=[^&]+&/, "?");
    newUrl = newUrl.replace(/\?code=[^&]+/, "");
    newUrl = newUrl.replace(/&code=[^&]+/, "");
    newUrl = newUrl.replace(/\?state=[^&]+&/, "?");
    newUrl = newUrl.replace(/\?state=[^&]+/, "");
    newUrl = newUrl.replace(/&state=[^&]+/, "");
    return newUrl;
}

module.exports = checkOpenid;
