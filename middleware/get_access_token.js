/**
 * Created by Jemo on 17-11-24.
 */

const oauthClient = require('./oauth_client');

// 获取openid与access-token
const getAccessToken = function (hostname, code) {
    return oauthClient(hostname).then(client => {
        return new Promise((resolve, reject) => {
            client.getAccessToken(code, (err, result) => {
                if (!err) {
                    return resolve(result.data);
                } else {
                    return reject(err);
                }
            });
        });
    });
};

module.exports = getAccessToken;
