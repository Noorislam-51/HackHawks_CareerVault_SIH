var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const passport = require("passport");
const flash = require('connect-flash');
const expressSession = require("express-session");

// Import routers
var indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');

// Import Student model
const studentModel = require('./models/StudentDB'); 


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Session + flash
app.use(flash());
app.use(expressSession({
  resave: false,
  saveUninitialized: true,
  secret: "SIH Project",
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Passport serialize/deserialize (using StudentModel from passport-local-mongoose)
passport.serializeUser(studentModel.serializeUser());
passport.deserializeUser(studentModel.deserializeUser());

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);
app.use('/', authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
