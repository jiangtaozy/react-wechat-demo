/**
 * Created by Jemo on 17-11-24.
 */

const oauthClient = require('./oauth_client');

// 获取用户信息
const getUserInfo = function (hostname, accessToken) {
    return oauthClient(hostname).then(client => {
        return new Promise((resolve, reject) => {
            client.getUser({
                openid: accessToken.openid,
                lang: 'zh_CN',
            }, function (err, result) {
                if(!err) {
                    return resolve({
                        accessToken: accessToken,
                        userInfo: result
                    });
                } else {
                    return reject(err);
                }
            });
        });
    });
};

module.exports = getUserInfo;
