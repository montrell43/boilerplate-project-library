'use strict';

const express    = require('express');
const bodyParser = require('body-parser');
const cors       = require('cors');
const mongoose   = require('mongoose');
require('dotenv').config();

const apiRoutes        = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner           = require('./test-runner');

const app = express();

// ----- Middleware -----
app.use('/public', express.static(process.cwd() + '/public'));
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ----- MongoDB Connection -----
const dbUri = process.env.NODE_ENV === 'test'
  ? process.env.MONGO_URI_TEST
  : process.env.MONGO_URI;

if (!dbUri) {
  console.error('❌ Missing MongoDB URI in environment variables');
  process.exit(1);
}

mongoose.connect(dbUri, { dbName: 'library' })
  .then(() => console.log(`✅ Connected to ${process.env.NODE_ENV || 'production'} database`))
  .catch(err => {
    console.error('❌ DB connection error:', err);
    process.exit(1);
  });

// ----- Index page -----
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// ----- FCC Testing routes -----
fccTestingRoutes(app);

// ----- API routes -----
apiRoutes(app);

// ----- 404 Middleware -----
app.use((req, res) => {
  res.status(404).type('text').send('Not Found');
});

// ----- Start server and tests -----
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('🚀 App is listening on port ' + listener.address().port);

  if (process.env.NODE_ENV === 'test') {
    console.log('🧪 Running Tests...');
    setTimeout(() => {
      try {
        runner.run();
      } catch (e) {
        console.error('❌ Tests are not valid:');
        console.error(e);
      }
    }, 1500);
  }
});

module.exports = app; // for unit/functional testing
