const redis = require('redis');

const redisClient = redis.createClient(6379, 'redis');

module.exports = class PlayerModel {
  constructor(playerId) {
    this._playerId = playerId;
  }

  /**
   * Returns key for the store to getting points.
   *
   * @returns {string}
   * @private
   */
  _keyPoints() {
    return `players:${this._playerId}:points`;
  }

  /**
   * Resolves points for the current user.
   *
   * @returns {Promise}
   */
  points() {
    return new Promise((resolve,reject) => {
      redisClient.get(this._keyPoints(),(err, reply) => {
        if(err) {
          reject(err);
        } else {
          const points = parseInt(reply);
          if(points || points===0) {
            resolve(points);
          } else {
            reject('Player does not exist.');
          }
        }
      });
    });
  }

  /**
   * Checks current user can take specified amount of points.
   *
   * @param points
   * @returns {Promise}
   */
  pointsCan(points) {
    return new Promise((resolve,reject) => {
      redisClient.get(this._keyPoints(),(err, reply) => {
        if(err) {
          reject(err);
        } else {
          const pointsOld = parseInt(reply);
          if(pointsOld || pointsOld===0) {
            if(pointsOld >= points) {
              resolve();
            } else {
              reject(`Player ${this._playerId} does not have enough points.`);
            }
          } else {
            reject(`Player ${this._playerId} does not exist.`);
          }
        }
      });
    });
  }

  /**
   * Adds points to the player account.
   *
   * @param points
   * @returns {Promise}
   */
  fund(points) {
    return new Promise((resolve,reject) => {
      redisClient.get(this._keyPoints(),(err, reply) => {
        if(err) {
          reject(err);
        } else {
          const old = parseInt(reply) || 0;
          redisClient.set(this._keyPoints(), parseInt(old) + parseInt(points),resolve);
        }
      });
    });
  }

  /**
   * Takes points from the player account.
   *
   * @param points
   * @returns {Promise}
   */
  take(points) {
    return new Promise((resolve,reject) => {
      redisClient.get(this._keyPoints(),(err, reply) => {
        if(err) {
          reject(err);
        } else {
          const pointsOld = parseInt(reply);
          if(pointsOld || pointsOld===0) {
            const rest = pointsOld - parseInt(points);
            if(rest >= 0) {
              redisClient.set(this._keyPoints(), rest,resolve);
            } else {
              reject('Player does not have enough points.');
            }
          } else {
            reject('Player does not exist.');
          }
        }
      });
    });
  }
};