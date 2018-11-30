module.exports = function () {
    return function secured (req, res, next) {
      //if (req.user) { return next(); }
      if(req.isAuthenticated()){
        return next();
      }
      req.session.returnTo = req.originalUrl;
      res.redirect('/landing');
    };
};