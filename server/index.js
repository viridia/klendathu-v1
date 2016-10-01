const path = require('path');
const express = require('express');
const { MongoClient } = require('mongodb');
const session = require('express-session');
const proxy = require('express-http-proxy');
const MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser');
const compression = require('compression');
const authActions = require('./actions/auth');
const projectsActions = require('./actions/projects');
const userActions = require('./actions/user');
const issuesActions = require('./actions/issues');
const logger = require('./common/logger');

// Constants
const PORT = 8080;
const DB_URL = 'mongodb://localhost:27017/klendathu';

// Promise which returns database connection.
const mongo = MongoClient.connect(DB_URL).catch(err => {
  logger.error(`Error connecting to database: ${err}`);
  process.exit(1);
});

mongo.then(db => {
  // App
  const app = express();

  // Store db handle on the application object for convenience.
  app.db = db;

  // Cross-domain config for local testing.
  const allowCrossDomain = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8081');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  };

  // Make our db accessible to our router
  app.use((req, res, next) => {
    req.db = app.db;
    next();
  });

  app.use(bodyParser.json());
  app.use(compression());
  app.use(session({
    secret: 'charles zim',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ db }),
  }));
  // app.use(express.methodOverride());
  app.use(allowCrossDomain);

  // Static files
  app.use('/fonts', express.static(path.join(__dirname, '../client/media/fonts')));
  app.use('/favicon', express.static(path.join(__dirname, '../client/media/favicon')));

  // Import routes
  const apiRouter = express.Router(); // eslint-disable-line new-cap
  authActions(app, apiRouter);
  projectsActions(app, apiRouter);
  issuesActions(app, apiRouter);
  userActions(app, apiRouter);
  app.use('/api', apiRouter);

  // Proxy for webpack dev server.
  app.use('/', proxy('http://localhost:8081'));

  // TODO: Replace this with a webpack-generated template file.
  // app.get('/', (req, res) => {
  //   res.sendFile(path.resolve(__dirname, '../client/index.html'));
  // });

  app.listen(PORT);
  logger.info(`Running on http://localhost: ${PORT}`);
});