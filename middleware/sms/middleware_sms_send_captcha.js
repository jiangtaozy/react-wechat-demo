var Promise = require("bluebird");
var redis = require("redis");
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);
var redisClient = redis.createClient();
var config = require('../../config/config');
// var captchaExpireTime = 1800;//秒
//验证码发送
var logger = global.logger;

var SMS = require('aliyun-sms-node');

var sms = new SMS({
    AccessKeyId: 'LTAIIVgOpabWGu0u',
    AccessKeySecret: 'U6oMMov56sF9xlfyuNakpFf6QaYoVI'
});

module.exports = function (req, res, next) {
    //四位随机数
    var captcha = 1000 + Math.floor(Math.random() * 999);
    logger.info('captcha: ', captcha);
    var phone = req.body.phone;
    const sms = new SMS({
        AccessKeyId: 'LTAIIVgOpabWGu0u',
        AccessKeySecret: 'U6oMMov56sF9xlfyuNakpFf6QaYoVI'
    });

    sms.send({
        Action: 'SendSms',
        Version: "2017-05-25",
        RegionId: "cn-hangzhou",
        PhoneNumbers: phone,//短信接受号码
        SignName: '阿里云短信测试专用',//短信签名
        TemplateParam: "{\"code\":\"" + captcha + "\"}",//短信模板变量替换JSON串
        TemplateCode: 'SMS_76591258'//短信模板ID
    })
    /*sms.send({
        Action: 'SendSms',
        Version:"2017-05-25",
        RegionId:"cn-hangzhou",
        PhoneNumbers:phone,
        SignName: '天参密码',
        TemplateParam:"{\"code\":\""+ captcha +"\"}",
        TemplateCode: 'SMS_84090004'
    })*/
        .then(function (data) {
            console.log(data);
            res.send({result: 'ok'});
        })
        .catch(function (err) {
            err.code = 6501;
            next(err);
            // res.send({result:'err',message:err.message});
            logger.error(err);
        });

    redisClient.setAsync(phone, captcha, 'EX', config.captchaExpireTime)
        .then(function () {
            logger.info('手机号 ' + phone + '获取验证码成功 ' + config.captchaExpireTime + ' 秒后过期');
        })
        .catch(function (err) {
            logger.error(err);
        });

};

