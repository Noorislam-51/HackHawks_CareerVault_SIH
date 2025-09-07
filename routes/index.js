var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Student login
router.get('/login/student', function(req, res, next) {
  res.render('./auth/student_auth.ejs', { title: 'Student Login' });
});

// Staff login
router.get('/login/staff', function(req, res, next) {
  res.render('./auth/staff_auth.ejs', { title: 'Staff Login' });
});

module.exports = router;
