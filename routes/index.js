var express = require('express');
var router = express.Router();
const isLoggedIn = require('../middleware/isLoggedIn') 
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

// Student login
router.get('/login/student', function(req, res, next) {
  res.render('./auth/student_auth.ejs', { title: 'Student Login' });
});

// Staff login
router.get('/login/staff', function(req, res, next) {
  res.render('./auth/staff_auth.ejs', { title: 'Staff Login' });
});

// view
// router.get('/student/edit',isLoggedIn, function(req, res, next) {
//   res.render('./student/studentEdit', { title: 'Student Dashboard' });
// });
router.get('/student/edit', function(req, res, next) {
  res.render('./student/studentEdit', { title: 'Student Dashboard' });
});


module.exports = router;