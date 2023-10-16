const express = require('express');
require('dotenv').config();
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const { logger } = require('./middleware/logEvent');
const errorHandler = require('./middleware/errorHandler');
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
const credentials = require('./middleware/credentials');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 3000;
const app = express();

// connect to MongoDB
connectDB();

// custom middleware to log request method and url
app.use(logger);

// Handle options credentials check - before CORS
// and fetch cookies credentials requirements
app.use(credentials);

// cross-origin resource sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded fform data
app.use(express.urlencoded({ extended: false }));

// built-in middleware to handle json data
app.use(express.json());

// middleware to parse cookies
app.use(cookieParser());

// built-in middleware to serve static files
// from a directory named 'public'
app.use(express.static(path.join(__dirname, '/public')));

// routes
app.use('/', require('./routes/root'));
app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));

// add verifyJWT middleware to all routes below
app.use(verifyJWT);
app.use('/employees', require('./routes/api/employees'));
app.use('/users', require('./routes/api/users'));

app.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.json({ error: 'Not found' });
  } else {
    res.type('txt').send('Not found');
  }
});

app.use(errorHandler);

// start server
mongoose.connection.once('open', () => {
  console.log('Mongoose connected');

  app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });
});
