var express = require('express');
var router = express.Router();
const passport = require("passport");
const studentModel = require('../models/StudentDB');
const staffModel = require('../models/StaffDB');
const localStrategy = require("passport-local");

// Student strategy
passport.use(new localStrategy({
  usernameField: 'studentId'  
}, studentModel.authenticate()));
// Staff strategy
passport.use("staff-local", new localStrategy(
  { usernameField: "staffId" }, 
  staffModel.authenticate()
));

// student register------------------
router.post("/register/student", async (req, res) => {
  const { studentId, collegeId, email, fullName, password } = req.body;

  try {
    const newStudent = new studentModel({
      studentId,
      collegeId,
      email,
      basicDetails: { fullName }
    });

    studentModel.register(newStudent, password, function (err, user) {
      if (err) {
        console.log("Registration error:", err);
        // Send proper 400 error with message
        return res.status(400).send(err.message);
      }

      passport.authenticate("student-local")(req, res, function () {
        res.redirect("/student/edit");
      });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).send("Server error");
  }
});
// Register Staff-------------------------------
router.post("/register/staff", async (req, res) => {
  const { staffId, collegeId, email, fullName, password,designation } = req.body;

  try {
    const newStaff = new staffModel({
      staffId,
      fullName,
      email,
      collegeId,
      designation
    });

    staffModel.register(newStaff, password, function (err, user) {
      if (err) {
        console.log("Staff Registration error:", err);
        return res.status(400).send(err.message);
      }

      passport.authenticate("staff-local")(req, res, function () {
        res.redirect("/staff/dashboard");
      });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).send("Server error");
  }
});



// student login ---------------
router.post("/login/student", passport.authenticate("local", {
  successRedirect: "/student/edit",
  failureRedirect: "/",
  failureFlash: true
}), function (req, res) { });
// Staff login----------------
router.post("/login/staff", passport.authenticate("staff-local", {
  successRedirect: "/staff/dashboard",
  failureRedirect: "/",
  failureFlash: true
}), function (req, res) { });


// logout----------
router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect("/");
  });
});

module.exports = router;