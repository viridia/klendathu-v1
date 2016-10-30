const path = require('path');
const express = require('express');
const passport = require('passport');
const { MongoClient } = require('mongodb');
const session = require('express-session');
const proxy = require('express-http-proxy');
const MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser');
const compression = require('compression');
const graphql = require('express-graphql');
const fallback = require('express-history-api-fallback');
const authActions = require('./actions/auth');
const schema = require('./schema');
const RootResolver = require('./resolvers/root');
const logger = require('./common/logger');

// Environment
const debug = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 8080;
const DB_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017/klendathu';

// Promise which returns database connection.
const mongo = MongoClient.connect(DB_URL).catch(err => {
  logger.error(`Error connecting to database: ${err}`);
  process.exit(1);
});

mongo.then(db => {
  db.collection('issues').createIndex({
    summary: 'text',
    description: 'text',
  });
  return db;
}).then(db => {
  // App
  const app = express();

  // Store db handle on the application object for convenience.
  app.db = db;

  // Cross-domain config for local testing.
  // const allowCrossDomain = (req, res, next) => {
  //   res.header('Access-Control-Allow-Origin', 'http://localhost:8081');
  //   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  //   res.header('Access-Control-Allow-Headers', 'Content-Type');
  //   next();
  // };

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
  // app.use(allowCrossDomain);

  // Static files
  app.use('/fonts', express.static(path.join(__dirname, '../client/media/fonts')));
  app.use('/favicon', express.static(path.join(__dirname, '../client/media/favicon')));
  app.use('/builds', express.static(path.join(__dirname, '../builds')));

  // Set up AJAX routes.
  const apiRouter = express.Router(); // eslint-disable-line new-cap

  // Initialize passport on /api route only.
  apiRouter.use(passport.initialize());
  apiRouter.use(passport.session());

  // TODO: Break passport initialization into it's own module.
  authActions(app, apiRouter);

  // Register GraphQL middleware
  apiRouter.use('/gql', graphql(req => ({
    schema,
    graphiql: true,
    // rootValue: { db: req.db, user: req.user },
    rootValue: new RootResolver(req.db, req.user),
    formatError: error => {
      if (error.originalError) {
        logger.error('original error:', error.originalError);
      } else {
        logger.error(error);
      }
      return {
        message: error.message,
        locations: error.locations,
        stack: error.stack,
        details: error.originalError,
      };
    },
  })));

  app.use('/api', apiRouter);

  if (debug) {
    // Proxy for webpack dev server.
    app.use('/', proxy('http://localhost:8081'));
  } else {
    // Serve frontend as static files with fallback.
    app.use('index.html', express.static(path.join(__dirname, '../client/index.html')));
    app.use(fallback('index.html', { root: path.join(__dirname, '../client') }));
  }

  app.listen(PORT);
  logger.info(`Running on http://localhost: ${PORT}`);
});
