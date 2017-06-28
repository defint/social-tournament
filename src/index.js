const express = require('express');
const PlayerController = require('./Controllers/PlayerController');
const TournamentController = require('./Controllers/TournamentController');
const AppController = require('./Controllers/AppController');

const app = express();

// Player
app.get('/balance', PlayerController.balance);
app.get('/fund', PlayerController.fund);
app.get('/take', PlayerController.take);

// Tournament
app.get('/announceTournament', TournamentController.announce);
app.get('/joinTournament', TournamentController.join);

// App
app.get('/reset', AppController.flush);

app.listen(3000, () => {
  console.log('Server start http://localhost:3000');
});
