var express = require('express');
var router = express.Router();
const isLoggedIn = require('../middleware/isLoggedIn');
const staffModel = require('../models/StaffDB');
const PendingDocument = require("../models/PendingDocumentDB");
const MasterStudent = require("../models/CollegeMasterDB");
  
router.get('/staff/dashboard', async (req, res, next) => {
  try {
    const search = req.query.search || '';
    const filter = req.query.filter || '';

    // Fetch pending documents
    let pendingDocs = await PendingDocument.find({ status: "pending" });

    // Apply search filter if provided
    if (search) {
      pendingDocs = pendingDocs.filter(doc => 
        doc.studentId.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply type filter if provided
    if (filter) {
      pendingDocs = pendingDocs.filter(doc => 
        doc.type.toLowerCase() === filter.toLowerCase()
      );
    }

    // Cross-check with Master DB
    const documents = await Promise.all(
      pendingDocs.map(async (doc) => {
        const masterStudent = await MasterStudent.findOne({ studentId: doc.studentId });
        let existsInMaster = false;
        if (masterStudent) {
          existsInMaster = masterStudent.documents.some(
            mDoc => mDoc.title.toLowerCase() === doc.title.toLowerCase()
          );
        }
        return {
          ...doc.toObject(),
          existsInMaster
        };
      })
    );

    // Render EJS template
    res.render('./staff/dashboard', {
      documents,
      search,
      filter
    });

  } catch (err) {
    console.error("Error fetching pending docs:", err);
    next(err);
  }
});

module.exports = router;
