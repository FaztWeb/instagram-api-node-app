const express = require('express');
const session = require('cookie-session');
const path = require('path');
const engine = require('ejs-mate');
const morgan = require('morgan');

// Initializations
const app = express();

// settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', engine);
app.set('view engine', 'ejs');

// Middlewares
app.use(morgan('dev'));
app.use(session({
  secret: 'mysecretword',
  signed: true
}));

// Global Variables
app.use((req, res, next) => {
  res.locals.formatDate = (date) => {
    let myDate = new Date(date * 1000);
    return myDate.toLocaleString();
  }

  if(req.session.access_token && req.session.access_token != 'undefined') {
    res.locals.isLoggedIn = true;
  } else {
    res.locals.isLoggedIn = false;
  }
  next();
});

// Routes
app.use(require('./routes/index'));

// static files
app.use(express.static(path.join(__dirname, 'public')));

// Starting the Server
app.listen(app.get('port'), () => {
  console.log('server on port', app.get('port'));
});