/*
 * Created by jemo on 2017-12-28.
 * redis client
 */

const redis = require('redis');
const config = require('../config/config');

const redisOptions = config.redisOptions;
const redisClient = redis.createClient(redisOptions.port, redisOptions.host);

redisClient.select(1, function() {
    logger.info('redis select store 1');
});

redisClient.on("error", function(err) {
    logger.info("Error: ", err);
});

const jsonSet = (key, value) => {
  return new Promise((resolve, reject) => {
    redisClient.hmset(key, value, (err, res) => {
      if(err) {
        return reject(err);
      } else {
        return resolve(value);
      }
    });
  });
}

const jsonGet = (key) => {
  return new Promise((resolve, reject) => {
    redisClient.hgetall(key, (err, res) => {
      if(err) {
        return reject(err);
      } else {
        return resolve(res);
      }
    });
  });
}

module.exports = redisClient;
module.exports.jsonSet = jsonSet;
module.exports.jsonGet = jsonGet;
