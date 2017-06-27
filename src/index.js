const express = require('express');
const PlayerController = require('./Controllers/PlayerController');
const AppController = require('./Controllers/AppController');

const app = express();

app.get('/balance', PlayerController.balance);
app.get('/fund', PlayerController.fund);
app.get('/take', PlayerController.take);
app.get('/reset', AppController.flush);

app.listen(3000, () => {
  console.log('Server start http://localhost:3000');
});
