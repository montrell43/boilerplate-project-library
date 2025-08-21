'use strict';

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api.js');       // Your routes
const fccTestingRoutes = require('./routes/fcctesting.js'); // FCC test routes
const runner = require('./test-runner');           // FCC test runner

const app = express();

// ----- Middleware -----
app.use('/public', express.static(process.cwd() + '/public'));
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ----- Index page -----
app.route('/')
  .get((req, res) => {
    res.sendFile(process.cwd() + '/views/index.html');
  });

// ----- FCC Testing Routes -----
fccTestingRoutes(app);

// ----- API Routes -----
apiRoutes(app);

// ----- 404 Middleware -----
app.use((req, res, next) => {
  res.status(404).type('text').send('Not Found');
});

// ----- MongoDB Connection -----
const dbUri = process.env.NODE_ENV === 'test'
  ? process.env.MONGO_URI_TEST
  : process.env.MONGO_URI;

mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log(`Connected to ${process.env.NODE_ENV || 'development'} database`);

    // ----- Start server -----
    const listener = app.listen(process.env.PORT || 3000, () => {
      console.log('Your app is listening on port ' + listener.address().port);

      // ----- Run FCC Tests -----
      if (process.env.NODE_ENV === 'test') {
        console.log('Running Tests...');
        setTimeout(() => {
          try {
            runner.run(); // This must exist for FCC tests to pass
          } catch (err) {
            console.log('Tests are not valid:');
            console.error(err);
          }
        }, 1500); // Delay ensures DB connection and server start
      }
    });
  })
  .catch(err => {
    console.error('DB connection error:', err);
  });

// ----- Export app for testing -----
module.exports = app;
