'use strict';

const express     = require('express');
const bodyParser  = require('body-parser');
const cors        = require('cors');
const mongoose    = require('mongoose');
require('dotenv').config();

const apiRoutes         = require('./routes/api.js');
const fccTestingRoutes  = require('./routes/fcctesting.js');
const runner            = require('./test-runner');

const app = express();

// ----- Middleware -----
app.use('/public', express.static(process.cwd() + '/public'));
app.use(cors({ origin: '*' })); // For FCC testing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ----- MongoDB Connection -----
const DB = process.env.DB;
mongoose.connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// ----- Index page -----
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

// ----- FCC Testing routes -----
fccTestingRoutes(app);

// ----- API routes -----
apiRoutes(app);  

// ----- 404 Middleware -----
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

// ----- Start server and tests -----
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 1500);
  }
});

module.exports = app; // for unit/functional testing
