var express = require('express');
var router = express.Router();
const isLoggedIn = require('../middleware/isLoggedIn')
const studentModel = require('../models/StudentDB');
const PendingDocument = require("../models/PendingDocumentDB");
const axios = require("axios");

router.get('/student/edit', async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login/student');
  }

  try {
    const studentId = req.user.studentId;

    // Fetch full student from DB
    const student = await studentModel.findOne({ studentId }).lean();
    if (!student) return res.redirect('/login/student');

    const pendingDocs = await PendingDocument.find({ studentId, status: "pending" }).lean();
    const pendingCount = pendingDocs.length;
    const allDocs = await PendingDocument.find({ studentId }).sort({ createdAt: -1 }).lean();

    res.render('./student/studentEdit', {
      title: 'Student Dashboard',
      student,          // now student has basicDetails
      pendingDocs,
      pendingCount,
      results: {},
      allDocs,
      userType: 'student'
    });

  } catch (err) {
    console.error("Error fetching student:", err);
    next(err);
  }
});


router.get('/student/view', async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login/student'); // redirect if not logged in
  }

  try {
    const studentId = req.user.studentId; // assuming req.user has studentId

    // Fetch all pending documents for this student
    const pendingDocs = await PendingDocument.find({ studentId, status: "pending" }).lean();
    // Count of pending documents
    const pendingCount = pendingDocs.length;


    // Render EJS with student info and pending docs
    res.render('./student/studentView', {
      title: 'Student Dashboard',
      student: req.user,
      pendingDocs,
      pendingCount    // <-- new
    });

  } catch (err) {
    console.error("Error fetching pending docs:", err);
    next(err);
  }
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



async function fetchSkillsFromAPI() {
  const { data } = await axios.get(
    "https://raw.githubusercontent.com/adamlouis/skills/master/skills.json"
  );
  return data; // returns an array of skill names
}


module.exports = router;