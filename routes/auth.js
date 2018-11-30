var express = require('express');
var router = express.Router();
var passport = require('passport');

// Perform the login, after login Auth0 will redirect to callback
router.get('/login', passport.authenticate('auth0', {
  scope: 'openid email profile'
}), function (req, res) {
  res.redirect('/');
});

// Perform the final stage of authentication and redirect to previously requested URL or '/'
router.get('/callback', function (req, res, next) {
  passport.authenticate('auth0', function (err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/'); }
    req.logIn(user, function (err) {
      if (err) { return next(err); }
      const returnTo = req.session.returnTo;
      delete req.session.returnTo;
      res.redirect(returnTo || '/');
    });
  })(req, res, next);
});

// Perform session logout and redirect to homepage
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('https://radixgeo.au.auth0.com/v2/logout?returnTo=https%3A%2F%2Fcsv-ingestion.herokuapp.com&client_id=pfN6WhslzOJgll5H0V1T6o7bjHOHluQ0');
  // res.redirect('https://radixgeo.au.auth0.com/v2/logout?returnTo=http%3A%2F%2Flocalhost%3A3000&client_id=pfN6WhslzOJgll5H0V1T6o7bjHOHluQ0');
});

module.exports = router;