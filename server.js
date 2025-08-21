'use strict';

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

const app = express();

// ----- Middleware -----
app.use('/public', express.static(process.cwd() + '/public'));
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----- MongoDB Connection -----
const dbUri =
  process.env.NODE_ENV === 'test'
    ? process.env.MONGO_URI_TEST
    : process.env.MONGO_URI;

mongoose.connect(dbUri)
  .then(() => console.log(`Connected to ${process.env.NODE_ENV} database`))
  .catch(err => console.error('DB connection error:', err));

// ----- Index page -----
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// ----- FCC Testing routes -----
fccTestingRoutes(app);

// ----- API routes -----
apiRoutes(app);

// ----- 404 Middleware -----
app.use((req, res, next) => {
  res.status(404).type('text').send('Not Found');
});

// ----- Start server and run tests -----
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

module.exports = app;
