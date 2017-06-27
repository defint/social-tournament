const redis = require('redis');

const redisClient = redis.createClient();

module.exports = class AppModel {
  flush() {
    return new Promise((resolve) => {
      redisClient.flushdb(() => {
        resolve();
      });
    });
  }
};