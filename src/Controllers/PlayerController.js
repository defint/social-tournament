const PlayerModel = require('../Models/PlayerModel');

module.exports = class PlayerController {
  static validatePlayer(req,res) {
    const playerId = req.query.playerId;

    if(!playerId) {
      res.status(400).json({ error: 'PlayerModel ID is empty.'});
      return true;
    }

    return false;
  }

  static validatePoints(req,res) {
    const points = req.query.points;

    if(!req.query.hasOwnProperty('points')) {
      res.status(400).json({ error: 'Amount of points is empty.'});
      return true;
    } else if(!parseInt(points) || parseInt(points) < 0) {
      res.status(400).json({ error: 'Invalid amount of points.'});
      return true;
    }

    return false;
  }

  static balance(req, res) {
    if(PlayerController.validatePlayer(req, res)) return;

    const playerId = req.query.playerId;
    const player = new PlayerModel(playerId);

    player.points().then((points) => {
      res.json({
        'playerId': playerId,
        'balance': points
      });
    }).catch(error => res.status(500).json({ error }));
  }

  static fund(req, res) {
    if(PlayerController.validatePlayer(req, res)) return;
    if(PlayerController.validatePoints(req, res)) return;

    const playerId = req.query.playerId;
    const points = req.query.points;

    const player = new PlayerModel(playerId);
    player.fund(points).then(() => {
      res.send('ok');
    }).catch(error => res.status(500).json({ error }));
  }

  static take(req, res) {
    if(PlayerController.validatePlayer(req, res)) return;
    if(PlayerController.validatePoints(req, res)) return;

    const playerId = req.query.playerId;
    const points = req.query.points;

    const player = new PlayerModel(playerId);
    player.take(points).then(() => {
      res.send('ok');
    }).catch(error => res.status(500).json({ error }));
  }
};