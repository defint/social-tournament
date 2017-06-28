const redis = require('redis');

const redisClient = redis.createClient();

module.exports = class TournamentModel {
  constructor(tournamentId) {
    this._tournamentId = tournamentId;
  }

  _keyDeposit() {
    return `tournaments:${this._tournamentId}:deposit`;
  }

  announce(deposit) {
    return new Promise((resolve,reject) => {
      redisClient.get(this._keyDeposit(),(err, reply) => {
        if(err) {
          reject(err);
        } else {
          const old = parseInt(reply) || 0;
          if(old) {
            reject('Tournament already exists.');
          } else {
            redisClient.set(this._keyDeposit(), parseInt(deposit),resolve);
          }
        }
      });
    });
  }
};