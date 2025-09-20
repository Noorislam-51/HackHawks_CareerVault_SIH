var express = require('express');
var router = express.Router();
const isLoggedIn = require('../middleware/isLoggedIn')
const staffModel = require('../models/StaffDB');
// const PendingDocument = require("../models/PendingDocumentDB");


router.get('/staff/dashboard', async (req, res, next) => {
  try {
    res.render('./staff/dashboard'); 
  } catch (err) {
    console.error("Error fetching pending docs:", err);
    next(err);
  }
});



module.exports = router;