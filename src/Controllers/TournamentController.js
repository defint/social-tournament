const TournamentModel = require('../Models/TournamentModel');
const PlayerController = require('./PlayerController');

module.exports = class TournamentController {
  static validateTournament(req,res) {
    const tournamentId = req.query.tournamentId;

    if(!tournamentId) {
      res.status(400).json({ error: 'Tournament ID is empty.'});
      return true;
    }

    return false;
  }

  static validateDeposit(req,res) {
    const deposit = req.query.deposit;

    if(!deposit) {
      res.status(400).json({ error: 'Amount of points is empty.'});
      return true;
    } else if(parseFloat(deposit) < 0) {
      res.status(400).json({ error: 'Invalid amount of points.'});
      return true;
    }

    return false;
  }

  static announce(req, res) {
    if(TournamentController.validateTournament(req, res)) return;
    if(TournamentController.validateDeposit(req, res)) return;

    const tournamentId = req.query.tournamentId;
    const deposit = req.query.deposit;

    const tournament = new TournamentModel(tournamentId);
    tournament.announce(deposit).then(() => {
      res.send('ok');
    }).catch(error => res.status(500).json({ error }));
  }

  static join(req, res) {
    if(TournamentController.validateTournament(req, res)) return;
    if(PlayerController.validatePlayer(req, res)) return;

    const tournamentId = req.query.tournamentId;
    const playerId = req.query.playerId;
    let backers = [];
    const backerIds = req.query.backerId;

    if(Array.isArray(backerIds)) {
      backers = backerIds.filter(item => item);
    } else {
      if(backerIds) {
        backers.push(backerIds);
      }
    }

    const tournament = new TournamentModel(tournamentId);
    tournament.join(playerId,backers).then(() => {
      res.send('ok');
    }).catch(error => res.status(500).json({ error }));
  }

  static result(req, res) {
    const body = req.body;
    let winners = [];

    if(!body.hasOwnProperty('tournamentId')) {
      res.status(400).json({ error: 'Tournament ID is empty.'});
      return;
    } else if (!body.winners) {
      res.status(400).json({ error: 'Winners are empty.'});
      return;
    } else if(!Array.isArray(body.winners) || body.winners.length === 0) {
      res.status(400).json({ error: 'Winners invalid.'});
      return;
    } else {
      winners = body.winners.filter(item => {
        return item.playerId && item.prize;
      });

      if(!winners) {
        res.status(400).json({ error: 'Winners invalid.'});
        return;
      }
    }

    const tournament = new TournamentModel(body.tournamentId);
    tournament.result(winners).then(() => {
      res.send('ok');
    }).catch(error => res.status(500).json({ error }));
  }
};