var express = require('express');
var router = express.Router();
const isLoggedIn = require('../middleware/isLoggedIn')
const studentModel = require('../models/StudentDB');

router.get('/student/edit', (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login/student'); // redirect if not logged in
  }
  // req.user comes from Passport (deserializeUser)
  res.render('./student/studentEdit', { 
    title: 'Student Dashboard',
    student: req.user   // pass user details to EJS
  });
});

// POST edit data (overwrite existing fields)
router.post('/student/edit-data', async (req, res) => {
  try {
    const { collegeId, email, fullName, dob, course, year, contact, address, skills } = req.body;

    const student = await studentModel.findOne({ studentId: req.user.studentId });
    if (!student) return res.status(404).send('Student not found');

    // Overwrite fields directly
    student.collegeId = collegeId || '';
    student.email = email || '';

    student.basicDetails = {
      fullName: fullName || '',
      dob: dob || '',
      course: course || '',
      year: year || '',
      contact: contact || '',
      address: address || ''
    };

    student.skills = skills
      ? Array.isArray(skills)
        ? skills
        : skills.split(',')
      : [];

    await student.save();
    res.redirect('/student/edit');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;