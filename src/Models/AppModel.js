const redis = require('redis');

const redisClient = redis.createClient(6379, 'redis');

module.exports = class AppModel {
  
  /**
   * Flush all database.
   *
   * @returns {Promise}
   */
  flush() {
    return new Promise((resolve) => {
      redisClient.flushdb(() => {
        resolve();
      });
    });
  }
};