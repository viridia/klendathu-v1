const passport = require('passport');
const bcrypt = require('bcrypt');
const { Strategy: LocalStrategy } = require('passport-local');
const { ObjectId } = require('mongodb');
const logger = require('../common/logger');

module.exports = function (app, apiRouter) {
  const users = app.db.collection('users');

  // Only those fields needed by the client.
  function userProfile(user) {
    return {
      id: user._id,
      fullname: user.fullname,
      username: user.username,
      photo: user.photo,
      verified: user.verified,
    };
  }

  // Initialize passport on /api route only.
  apiRouter.use(passport.initialize());

  // Set up local username+password strategy
  passport.use(new LocalStrategy({
    passReqToCallback: true,
    session: true,
  }, (req, username, password, done) => {
    users.findOne({ username }).then(user => {
      if (!user) {
        return done(null, false, { err: 'unknown-user' });
      }
      // Compare user password hash with password.
      return bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          logger.info('Login successful:', username);
          return done(null, user);
        } else if (err) {
          logger.error('User login error:', err);
          return done(null, false, { err: 'internal' });
        } else {
          return done(null, false, { err: 'incorrect-password' });
        }
      });
    }, err => {
      logger.error('users.findOne:', username, err);
      return done(err);
    });
  }));

  passport.serializeUser((user, cb) => {
    cb(null, user._id);
  });

  passport.deserializeUser((id, cb) => {
    users.findOne({ _id: new ObjectId(id) }).then(user => {
      cb(null, user);
    }, err => {
      logger.error('deserializeUser.error:', err);
      cb(err);
    });
  });

  // Initialize sessions
  apiRouter.use(passport.session());

  // Returns profile of current logged-in user
  apiRouter.get('/profile', (req, res) => {
    if (req.user) {
      return res.send(userProfile(req.user));
    } else {
      logger.info('/profile: not logged in.');
      return res.status(401).send({});
    }
  });

  // Login Handler
  apiRouter.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) { return next(err); }
      if (!user) { return res.send(info); }
      return req.logIn(user, () => {
        return res.send(userProfile(user));
      });
    })(req, res, next);
  });

  // Logout Handler
  apiRouter.post('/logout', (req, res) => {
    if (req.user) {
      req.logOut(req.user);
    }
    return res.send({});
  });

  // Signup handler
  apiRouter.post('/signup', (req, res) => {
    const { email, username, fullname, password, password2 } = req.body;
    // TODO: Validate email, username, fullname.
    if (email.length < 3) {
      res.send({ err: 'invalid-email' });
    } else if (password !== password2) {
      res.send({ err: 'password-match' });
    } else {
      users.findOne({ username }).then(user => {
        if (user) {
          // User name taken
          res.json({ err: 'user-exists' });
        } else {
          // Compute password hash
          bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
              logger.error('Password hash error:', err);
              res.json({ err: 'internal' });
            } else {
              // Insert new user into the database.
              users.insertOne({
                username,
                fullname,
                email,
                password: hash,
                photo: null,
                projects: [],
                organizations: [],
                verified: false,
              }).then(u => {
                logger.info('User creation successful:', username);
                return req.logIn(u, () => {
                  return res.json(userProfile(u));
                });
              }, reason => {
                logger.error('User creation error:', reason);
                res.json({ err: 'internal' });
              });
            }
          });
        }
      });
    }
  });
};
