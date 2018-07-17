/**
 * Created by Larry on 17-7-12.
 * 验证码检查
 */
var Promise = require("bluebird");
var redis = require("redis");
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);
var redisClient = redis.createClient();
var logger = global.logger;

module.exports = function (req, res, next) {
    var captcha = req.body.captcha;
    var phone = req.body.phone;
    redisClient.getAsync(phone)
        .then(function (data) {
            // return Promise.resolve();//临时的
            if (captcha === data) {
                return Promise.resolve();
            } else {
                var err = new Error('mismatch captcha');

                err.code = 200;
                return Promise.reject(err);
            }
        })
        .then(function () {

            redisClient.delAsync(phone)
                .then(function (n) {
                    logger.info('验证码验证通过,并清除成功 ' + n + '个 ' + phone);
                })
                .catch(function (err) {
                    logger.error(err);
                })

        })
        .then(function () {
            // res.send({result:'ok'})
            next();
        })
        .catch(function (err) {
            console.log('error: ', err);
            err.code = 501;
            err.message = 'captcha service error';
            next(err);
        })
};
