const winston = require('winston');

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ level: 'debug' }),
    // new (winston.transports.File)({ filename: 'server.log' }),
  ],
});

module.exports = logger;
