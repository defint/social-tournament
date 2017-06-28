const PlayerModel = require('./PlayerModel');
const redis = require('redis');

const redisClient = redis.createClient();

module.exports = class TournamentModel {
  constructor(tournamentId) {
    this._tournamentId = tournamentId;
  }

  _keyDeposit() {
    return `tournaments:${this._tournamentId}:deposit`;
  }

  checkExist() {
    return new Promise((resolve,reject) => {
      redisClient.get(this._keyDeposit(),(err, reply) => {
        if(err) {
          reject(err);
        } else {
          const deposit = parseInt(reply) || 0;
          const isExist = !!deposit;
          resolve({isExist,deposit});
        }
      });
    });
  }

  announce(deposit) {
    return new Promise((resolve,reject) => {
      this.checkExist().then((exist) => {
        if(exist.isExist) {
          reject('Tournament already exists.');
        } else {
          redisClient.set(this._keyDeposit(), parseInt(deposit),resolve);
        }
      });
    });
  }

  join(playerId,backers) {
    return new Promise((resolve,reject) => {
      this.checkExist().then((exist) => {
        if(!exist.isExist) {
          reject('Tournament does not exist.');
        } else {
          const players = backers.concat([playerId]);
          const selfDeposit = Math.ceil(exist.deposit / players.length);
          const promises = players.map(player => {
            const playerModel = new PlayerModel(player);
            return playerModel.pointsCan(selfDeposit);
          });
          Promise.all(promises).then(() => {
            resolve();
          }).catch(reject);
        }
      });
    });
  }
};