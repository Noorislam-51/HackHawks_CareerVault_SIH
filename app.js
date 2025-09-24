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
const studentRouter = require('./routes/student');
const pendingDocsRoutes = require("./routes/pendingDocs");
const staffRouter = require('./routes/staff'); // adjust path
const verificationRoutes = require("./routes/verification");
const uploadMarkAttendanceRoutes = require("./routes/uploadMarksheetAttendance");

// Import Student model
const studentModel = require('./models/StudentDB'); 
const staffModel = require('./models/StaffDB');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');  
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

// // Passport serialize/deserialize (using StudentModel from passport-local-mongoose)
// passport.serializeUser(studentModel.serializeUser());
// passport.deserializeUser(studentModel.deserializeUser());


// ----------------- STRATEGIES -----------------
// Student strategy
passport.use('student-local', studentModel.createStrategy());

// Staff strategy
passport.use('staff-local', staffModel.createStrategy());

// Serialize / Deserialize
passport.serializeUser(function (user, done) {
  done(null, { id: user.id, type: user.staffId ? 'staff' : 'student' });
});

passport.deserializeUser(async function (obj, done) {
  try {
    if (obj.type === 'student') {
      const student = await studentModel.findById(obj.id);
      return done(null, student);
    } else {
      const staff = await staffModel.findById(obj.id);
      return done(null, staff);
    }
  } catch (err) {
    return done(err, null);
  }
});

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/', studentRouter);
app.use('/', pendingDocsRoutes);
app.use('/', staffRouter);
app.use('/', uploadMarkAttendanceRoutes);
app.use("/staff", verificationRoutes); // ✅ Mount the route

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
