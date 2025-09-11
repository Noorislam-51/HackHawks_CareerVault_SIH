var express = require('express');
var router = express.Router();
const passport = require("passport");
const studentModel = require('../models/StudentDB');
const localStrategy = require("passport-local");
passport.use(new localStrategy({
  usernameField: 'studentId'  // Make sure this matches your schema
}, studentModel.authenticate()));

// authentication------------------
router.post("/register/student", async (req, res) => {
  const { studentId, collegeId, email, fullName, password } = req.body;

  if (!studentId || !collegeId || !email || !fullName || !password) {
    console.log("Missing required fields");
    return res.status(400).send("All required fields must be filled");
  }

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

      passport.authenticate("local")(req, res, function () {
        res.redirect("/view");
      });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).send("Server error");
  }
});


// login ---------------
router.post("/login/student", passport.authenticate("local", {
  successRedirect: "/view",
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