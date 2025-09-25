var express = require('express');
var router = express.Router();
const isLoggedIn = require('../middleware/isLoggedIn');
const staffModel = require('../models/StaffDB');
const PendingDocument = require("../models/PendingDocumentDB");
const MasterStudent = require("../models/CollegeMasterDB");

// Staff dashboard: fetch pending docs
// Staff dashboard: fetch pending docs
router.get('/staff/dashboard', async (req, res) => {
  try {
    const search = req.query.search || "";
    const filter = req.query.filter || "";

    const pendingDocs = await PendingDocument.find({ status: "pending" });

    const docsWithMasterCheck = await Promise.all(
      pendingDocs.map(async (doc) => {
        const masterStudent = await MasterStudent.findOne({ studentId: doc.studentId });
        let existsInMaster = false;
        let studentName = "";

        if (masterStudent) {
          existsInMaster = masterStudent.documents.some(
            (mDoc) => mDoc.title.toLowerCase() === doc.title.toLowerCase()
          );
          studentName = masterStudent.fullName;
        }

        return { ...doc.toObject(), existsInMaster, studentName };
      })
    );

    res.render("staff/dashboard", {
      documents: docsWithMasterCheck,
      search,   // ✅ pass search
      filter ,
      userType: 'staff'   // ✅ pass filter
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching pending documents");
  }
});


module.exports = router;
