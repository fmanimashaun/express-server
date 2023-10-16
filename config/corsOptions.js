const allowedOrigins = require('./allowedOrigins');

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      // origin is in the allowedOrigins
      callback(null, true);
    } else {
      // origin is not in the allowedOrigins
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200
};

module.exports = corsOptions;