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

  _keyPlayer(playerId) {
    return `tournaments:${this._tournamentId}:player:${playerId}`;
  }

  _keyBacker(playerId,backerId) {
    return this._keyPlayer(playerId)+`:backer:${backerId}`;
  }

  checkExistPlayer(playerId) {
    return new Promise((resolve,reject) => {
      redisClient.get(this._keyPlayer(playerId),(err, reply) => {
        if(err) {
          reject(err);
        } else {
          if(reply && reply === 'ok') {
            reject('Player already in the tournament.');
          } else {
            resolve();
          }
        }
      });
    });
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

          // Check all players can join to the tournament.
          const players = backers.concat([playerId]);
          const selfDeposit = Math.ceil(exist.deposit / players.length);
          const promises = players.map(player => {
            const playerModel = new PlayerModel(player);
            return playerModel.pointsCan(selfDeposit);
          });

          // Check player does not exist on the tournament.
          promises.push(this.checkExistPlayer(playerId));

          // Funds and add players to the store.
          Promise.all(promises).then(() => {
            const promisesFund = [];

            redisClient.set(this._keyPlayer(playerId), 'ok');
            const playerModel = new PlayerModel(playerId);
            promisesFund.push(playerModel.take(selfDeposit));

            backers.forEach((backerId) => {
              redisClient.set(this._keyBacker(playerId,backerId), 'ok');

              const backerModel = new PlayerModel(backerId);
              promisesFund.push(backerModel.take(selfDeposit));
            });

            Promise.all(promisesFund).then(resolve).catch(reject);
          }).catch(reject);
        }
      });
    });
  }
};