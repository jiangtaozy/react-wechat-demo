/**
 *
 * qcloud sms invoke
 *
 */
use
'strict'


var QcloudSms = require("qcloudsms_js");

module.exports = function (req, res, next) {
    var body = req.body;

    var phoneNum = body.phoneNum;

    console.log('phone: ', phoneNum)

    // 短信应用SDK AppID
    var appid = 1400066950;  // SDK AppID是1400开头

    // 短信应用SDK AppKey
    var appkey = "5f622b5c2cd828fa23a5fd291ed328f4";

    // 需要发送短信的手机号码
    var phoneNumbers = [phoneNum];

    // 短信模板ID，需要在短信应用中申请
    var templateId = '84386';  // NOTE: 这里的模板ID`7839`只是一个示例，真实的模板ID需要在短信控制台中申请

    // 签名
    var SmsSign = "千盟科技";  // NOTE: 这里的签名只是示例，请使用真实的已申请的签名, 签名参数使用的是`签名内容`，而不是`签名ID`

    // 实例化QcloudSms
    var qcloudsms = QcloudSms(appid, appkey);

    // 设置请求回调处理, 这里只是演示，用户需要自定义相应处理回调
    function callback(err, resp, resData) {
        if (err) {
            console.log("err:", err);
        } else {
            // console.log("response data: ", resData);
            res.send({
                captchaData: params[0]
            })
        }
    }

    function captcha() {
        let randomNum = parseInt(Math.random() * 1000000, 10).toString();
        if (randomNum.length !== 6) {
            randomNum += '0';
        }
        return randomNum;
    }


    var ssender = qcloudsms.SmsSingleSender();
    var params = [captcha(), "5"];
    console.log('i am here', params, phoneNumbers[0])
    ssender.sendWithParam(86, phoneNumbers[0], templateId,
        params, SmsSign, "", "", callback);  // 签名参数未提供或者为空时，会使用默认签名发送短信

};
