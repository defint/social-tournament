const AppModel = require('../Models/AppModel');

module.exports = class AppController {
  static flush(req, res) {
    const app = new AppModel();
    app.flush().then(() => {
      res.send('ok');
    }).catch(error => res.status(500).json({ error }));
  }
};