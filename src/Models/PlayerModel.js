const redis = require('redis');

const redisClient = redis.createClient();

module.exports = class PlayerModel {
  constructor(playerId) {
    this._playerId = playerId;
  }

  _keyPoints() {
    return `players:${this._playerId}:points`;
  }

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
              reject('User does not have enough points.');
            }
          } else {
            reject('Player does not exist.');
          }
        }
      });
    });
  }
};