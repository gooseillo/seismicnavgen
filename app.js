var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var Auth0Strategy = require('passport-auth0');
var logger = require('morgan');

var userInViews = require('./lib/middleware/userInViews');
var authRouter = require('./routes/auth');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var strategy = new Auth0Strategy(
  {
    domain: process.env.AUTH0_DOMAIN || 'radixgeo.au.auth0.com',
    clientID: process.env.AUTH0_CLIENT_ID || 'pfN6WhslzOJgll5H0V1T6o7bjHOHluQ0',
    clientSecret: process.env.AUTH0_CLIENT_SECRET || '6GOm28_Uhp8Isjf9aMppT83v_iJ9OhU48e869Y9_4oeMAi4uibbIucEVVuJf1gv5',
    callbackURL: process.env.AUTH0_CALLBACK_URL || 'http://seismicnavgen-env.fpqwk5uhuy.ap-southeast-2.elasticbeanstalk.com/callback'
  },
  function (accessToken, refreshToken, extraParams, profile, done){
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user
    return done(null, profile);
  }
);

passport.use(strategy);

// You can use this section to keep a smaller payload
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var sess = {
  secret: 'MY SECRET',
  cookie: {},
  resave: false,
  saveUninitialized: true
};

if(app.get('env') === 'production') {
  sess.cookie.secure = true;
}

app.use(session(sess));
app.use(passport.initialize());
app.use(passport.session());

app.use(userInViews());
app.use('/', authRouter);
app.use('/', indexRouter);
app.use('/', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
