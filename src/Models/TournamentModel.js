const PlayerModel = require('./PlayerModel');
const redis = require('redis');

const redisClient = redis.createClient(6379, 'redis');

module.exports = class TournamentModel {
  constructor(tournamentId) {
    this._tournamentId = tournamentId;
  }

  /**
   * Returns key for the store to getting deposit.
   *
   * @returns {string}
   * @private
   */
  _keyDeposit() {
    return `tournaments:${this._tournamentId}:deposit`;
  }

  /**
   * Returns key for the store to getting player.
   *
   * @returns {string}
   * @private
   */
  _keyPlayer(playerId) {
    return `tournaments:${this._tournamentId}:player:${playerId}`;
  }

  /**
   * Returns key for the store to getting backer.
   *
   * @returns {string}
   * @private
   */
  _keyBacker(playerId,backerId) {
    return this._keyPlayer(playerId)+`:backer:${backerId}`;
  }

  /**
   * Returns key for the store to getting all backers.
   *
   * @returns {string}
   * @private
   */
  _keyBackerAll(playerId) {
    return this._keyPlayer(playerId)+`:backer:*`;
  }

  /**
   * Returns key for the store to getting end of tournament.
   *
   * @returns {string}
   * @private
   */
  _keyEnd() {
    return `tournaments:${this._tournamentId}:end`;
  }

  /**
   * Checks player exists on the tournament.
   *
   * @param playerId
   * @returns {Promise}
   */
  checkExistPlayer(playerId) {
    return new Promise((resolve,reject) => {
      redisClient.get(this._keyPlayer(playerId),(err, reply) => {
        if(err) {
          reject(err);
        } else {
          if(reply) {
            reject('Player already in the tournament.');
          } else {
            resolve();
          }
        }
      });
    });
  }

  /**
   * Check tournament already exists.
   *
   * @returns {Promise}
   */
  checkExist() {
    return new Promise((resolve,reject) => {
      redisClient.get(this._keyDeposit(),(err, reply) => {
        if(err) {
          reject(err);
        } else {
          redisClient.get(this._keyEnd(),(errEnd, replyEnd) => {
            if(errEnd) {
              reject(errEnd);
            } else {
              const deposit = parseInt(reply) || 0;
              const isExist = !!deposit;
              const isEnd = !!replyEnd;

              resolve({isExist,deposit,isEnd});
            }
          });
        }
      });
    });
  }

  /**
   * Announces tournament.
   *
   * @param deposit
   * @returns {Promise}
   */
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

  /**
   * Joins player to the tournament.
   *
   * @param playerId
   * @param backers
   * @returns {Promise}
   */
  join(playerId,backers) {
    return new Promise((resolve,reject) => {
      this.checkExist().then((exist) => {
        if(!exist.isExist) {
          reject('Tournament does not exist.');
        } else if(exist.isEnd) {
          reject('Tournament has been ended.');
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
            const promisesTake = [];

            redisClient.set(this._keyPlayer(playerId), playerId);
            redisClient.set(this._keyBacker(playerId,playerId), playerId);
            const playerModel = new PlayerModel(playerId);
            promisesTake.push(playerModel.take(selfDeposit));

            backers.forEach((backerId) => {
              redisClient.set(this._keyBacker(playerId,backerId), backerId);

              const backerModel = new PlayerModel(backerId);
              promisesTake.push(backerModel.take(selfDeposit));
            });

            Promise.all(promisesTake).then(resolve).catch(reject);
          }).catch(reject);
        }
      });
    });
  }

  /**
   * Funds prize.
   *
   * @param key
   * @param prize
   * @returns {Promise}
   */
  fundPrize(key,prize) {
    return new Promise((resolve,reject) => {
      redisClient.get(key,(err, reply) => {
        if(err) {
          reject(err);
        } else {
          const player = new PlayerModel(reply);
          player.fund(prize).then(resolve);
        }
      });
    });
  }

  /**
   * Funds money for all backers.
   *
   * @param playerId
   * @param prize
   * @returns {Promise}
   */
  win(playerId,prize) {
    return new Promise((resolve,reject) => {
      redisClient.keys(this._keyBackerAll(playerId), (err, keys) => {
        if (err) {
          reject(err);
          return;
        }

        if(keys.length === 0) {
          reject('Winner does not have any players or backers.');
          return;
        }

        const prizeToFund = Math.floor(prize / keys.length);

        const promises = keys.map((item) => {
          return this.fundPrize(item,prizeToFund);
        });

        Promise.all(promises).then(resolve);
      });
    });
  }

  /**
   * Funds money for all winners.
   *
   * @param winners
   * @returns {Promise}
   */
  result(winners) {
    return new Promise((resolve,reject) => {
      this.checkExist().then((exist) => {
        if(!exist.isExist) {
          reject('Tournament does not exist.');
        } else if(exist.isEnd) {
          reject('Tournament has been ended.');
        } else {
          const promises = winners.map(item => {
            return this.win(item.playerId,item.prize);
          });

          Promise.all(promises).then(() => {
            redisClient.set(this._keyEnd(), 'true',resolve);
          });
        }
      })
    });
  }
};