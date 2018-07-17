/*
 * Created by jemo on 2018-5-9.
 * 微信配置信息中间件
 */

// wechat配置信息
const get = function(hostname) {
    let config = {
        uid: '0e4d72b6-39ac-4317-b23a-2dd1034a94fa',
        gzh_name: '乐正商城', // 公众号名称
        token: 'jjyyfuck', // 公众号token
        encoding_aes_key: 'gNTOVV2lftjYqAXImoAHrzjXt13Bn4lvjijET4iBmVu', // 公众号aes_key
        app_id: 'wx8d8e2dd3ce250894', // 公众号app_id
        app_key: 'aa1c0018359d3cac885b6419fd31a486', // 公众号app_key
        kehu_domain: hostname,
        wechat_mch_id: '1492083062', // 微信支付商户号
        wechat_partner_key: '75paidfullprice87878989123456789', // 微信支付key
        wechat_apiclient_cert: 'apiclient_cert_1492083062.p12', // 微信支付秘钥文件
        ali_app_id: '2016090800465238', // 支付宝app_id
        ali_rsa_private: 'app_private_key.pem', // 支付宝私钥文件
        ali_rsa_public: 'alipay_public_key.pem', // 支付宝公钥文件
    };
    return Promise.resolve(config);
}

exports.get = get;
