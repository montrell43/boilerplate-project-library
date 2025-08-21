'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const apiRoutes = require('./routes/api.js');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(process.cwd() + '/public'));

// MongoDB Connection
const dbUri =
  process.env.NODE_ENV === 'test'
    ? process.env.MONGO_URI_TEST
    : process.env.MONGO_URI;

mongoose.connect(dbUri)
  .then(() => console.log(`Connected to ${process.env.NODE_ENV} database`))
  .catch(err => console.error('DB connection error:', err));

// Routes
apiRoutes(app);

// Index page
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// ----- FCC Testing API route -----
app.get('/_api/get-tests', (req, res) => {
  if (!runner || !runner.testResults) {
    return res.json([]); // return empty array if tests not run yet
  }
  res.json(runner.testResults); // send array of test results
});


// 404
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

// Export app for testing
module.exports = app;

// Start server only if not required by tests
if (!module.parent) {
  const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('🚀 App is listening on port ' + listener.address().port);
  });
}
