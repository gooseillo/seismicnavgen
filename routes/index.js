var express = require('express');
var secured = require('../lib/middleware/secured');
var router = express.Router();

/* GET home page. */
router.get('/', secured(), function(req, res, next) {
  res.render('index', { user: req.user });
});

router.get('/landing', function(req, res, next){
  res.render('landing');
});

module.exports = router;
