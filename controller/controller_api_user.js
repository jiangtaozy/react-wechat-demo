/*
 * Created by jemo on 2017-12-26.
 * 微信用户信息
 */

const { User } = require('../models/db');
const md5 = require('md5');
const salt = require('../config/config').pwd_salt;

exports.get = get;
exports.getPromise = getPromise;
exports.bind = bind;

function get(req, res, next) {
    let wechatUserInfo = req.session.wechatUserInfo || {}
    let openid = wechatUserInfo.openid;
    openid = 'oIPhb0UTUDakjefaZPx0A_-SC_C4' // test

    User.findOne({
        attributes: [
            'id',
            'phone',
            'weixin_openid',
            'weixin_nickname',
            'weixin_headimgurl',
            'level_member', // 会员所处级别
            'balances',
            'points',
            'created_at',
        ],
        where: {
            weixin_openid: openid,
            del: false,
        },
        raw: true,
    }).then(function(result) {
        let data = {
            result: 'ok',
            data: result,
        };
        //logger.info('data: ', data);
        res.send(data);
    }).catch(function(error) {
        logger.error(error);
        let data = {
            result: 'err',
            message: error,
        };
        res.send(data);
    });
}

function getPromise(req, res, next) {
    let wechatUserInfo = req.session.wechatUserInfo || {}
    let openid = wechatUserInfo.openid;
    //openid = 'oIPhb0UTUDakjefaZPx0A_-SC_C4' // test

    return User.findOne({
        attributes: [
            'id',
            'weixin_openid',
            'weixin_nickname',
            'weixin_headimgurl',
            'level_member', // 会员所处级别
            'balances',
            'points',
            'created_at',
        ],
        where: {
            weixin_openid: openid,
            del: false,
        }
    });
}

async function bind(req, res, next) {
    let { phone, password } = req.body;
    //logger.info('phone: ', phone);
    //logger.info('password: ', password);
    let wechatUserInfo = req.session.wechatUserInfo || {};
    let openid = wechatUserInfo.openid;
    //openid = 'oIPhb0UTUDakjefaZPx0A_-SC_C4'; // test
    password = md5(password + salt);
    try {
        const count = await User.count({
            where: {
                phone,
                del: false,
            },
        });
        logger.info('count: ', count);
        let result;
        if(count > 0) {
            // 已经在app中注册,绑定微信opeind
            result = Promise.all([
                User.update({
                    del: true,
                },
                {
                    where: {
                        weixin_openid: openid,
                        del: false,
                    },
                }),
                User.update({
                    weixin_openid: openid,
                },
                {
                    where: {
                        phone,
                        del: false,
                    },
                }),
            ]);
        } else {
            // 未在app中注册,绑定手机号
            result = await User.update({
                phone,
                pwd: password,
            },
            {
                where: {
                    weixin_openid: openid,
                    del: false,
                },
            });
        }
        console.log('result: ', result);
        const data = {
            result: 'ok',
        };
        res.json(data);
    }
    catch(error) {
        logger.info('error: ', error);
        next(error);
    }
}
