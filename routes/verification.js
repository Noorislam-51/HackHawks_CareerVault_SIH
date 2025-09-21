const express = require("express");
const multer = require("multer");
const path = require("path");
const MasterStudent = require("../models/CollegeMasterDB");
const PendingDocument = require("../models/PendingDocumentDB");
const Student = require("../models/StudentDB")
const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../public/images/uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Upload route
router.post("/upload-master-doc", upload.single("file"), async (req, res) => {
  try {
    const { studentId, fullName, category, title } = req.body;

    if (!req.file) return res.status(400).send("No file uploaded");

    const file_url = `/images/uploads/${req.file.filename}`;

    // Find or create student
    let student = await MasterStudent.findOne({ studentId });
    if (!student) {
      student = new MasterStudent({
        studentId,
        fullName,
        documents: []
      });
    }

    // Add document
    student.documents.push({
      category,
      title,
      file_url,
      issueDate: new Date()
    });

    await student.save();
    res.send("✅ Document uploaded successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error uploading document");
  }
});

// GET: /verification/pending
// GET: /verification/pending
router.get('/verification/pending', async (req, res) => {
  try {
    const search = req.query.search || '';
    const filter = req.query.filter || '';

    let pendingDocs = await PendingDocument.find({ status: 'pending' });

    if (search) {
      pendingDocs = pendingDocs.filter(doc => 
        doc.studentId && doc.studentId.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filter) {
      pendingDocs = pendingDocs.filter(doc =>
        doc.type && doc.type.toLowerCase() === filter.toLowerCase()
      );
    }

    const documents = await Promise.all(
      pendingDocs.map(async doc => {
        const masterStudent = await MasterStudent.findOne({ studentId: doc.studentId });
        let existsInMaster = false;
        let studentName = '';
        if (masterStudent && Array.isArray(masterStudent.documents)) {
          existsInMaster = masterStudent.documents.some(
            mDoc => mDoc.title.toLowerCase() === doc.title.toLowerCase()
          );
          studentName = masterStudent.fullName || '';
        }
        return { ...doc.toObject(), existsInMaster, studentName };
      })
    );

    res.render('/staff/dashboard', {
      documents,
      search,
      filter
    });
  } catch (err) {
    console.error("Error fetching pending docs:", err);
    res.status(500).send('Server Error');
  }
});


// POST: /verification/approve/:id
// router.post('/verification/approve/:id', async (req, res) => {
//   try {
//     const docId = req.params.id;

//     // Find pending document
//     const pendingDoc = await PendingDocument.findById(docId);
//     if (!pendingDoc) return res.status(404).send('Document not found');

//     // Mark as approved
//     pendingDoc.status = 'approved';
//     await pendingDoc.save();

//     // Add document to Student DB in appropriate card
//     const student = await Student.findOne({ studentId: pendingDoc.studentId });
//     if (!student) return res.status(404).send('Student not found');

//     if (!student.cards[pendingDoc.type]) student.cards[pendingDoc.type] = [];

//     student.cards[pendingDoc.type].push({
//       title: pendingDoc.title,
//       type: pendingDoc.type,
//       file_url: pendingDoc.file_url,
//       verified: true,
//       upload_date: pendingDoc.upload_date
//     });

//     await student.save();

//     res.redirect('/verification/pending');
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Error approving document');
//   }
// });
// ---------------- APPROVE DOCUMENT ----------------
router.post('/verification/approve/:id', async (req, res) => {
  try {
    const docId = req.params.id;
    const pendingDoc = await PendingDocument.findById(docId);
    if (!pendingDoc) {
      req.flash('error', 'Document not found');
      return res.redirect('/verification/pending');
    }

    pendingDoc.status = 'approved';
    await pendingDoc.save();

    const student = await Student.findOne({ studentId: pendingDoc.studentId });
    if (student) {
      student.cards = student.cards || {};
      student.cards[pendingDoc.type] = student.cards[pendingDoc.type] || [];
      student.cards[pendingDoc.type].push({
        title: pendingDoc.title,
        type: pendingDoc.type,
        file_url: pendingDoc.file_url,
        verified: true,
        upload_date: pendingDoc.upload_date
      });
      await student.save();
    }

    req.flash('success', 'Document approved successfully!');
    res.redirect('/verification/pending');
  } catch (err) {
    console.error("Error approving document:", err);
    req.flash('error', 'Error approving document');
    res.redirect('/verification/pending');
  }
});



// POST: /verification/reject/:id
// router.post('/verification/reject/:id', async (req, res) => {
//   try {
//     const docId = req.params.id;

//     const pendingDoc = await PendingDocument.findById(docId);
//     if (!pendingDoc) return res.status(404).send('Document not found');

//     pendingDoc.status = 'rejected';
//     pendingDoc.staff_comments = 'Rejected by staff';
//     await pendingDoc.save();

//     res.redirect('/verification/pending');
//   } catch (err) {
//     console.error("Error rejecting document:", err);
//     res.status(500).send('Error rejecting document');
//   }
// });
router.post('/verification/reject/:id', async (req, res) => {
  try {
    const docId = req.params.id;
    const pendingDoc = await PendingDocument.findById(docId);
    if (!pendingDoc) {
      req.flash('error', 'Document not found');
      return res.redirect('/verification/pending');
    }

    pendingDoc.status = 'rejected';
    pendingDoc.staff_comments = 'Rejected by staff';
    await pendingDoc.save();

    req.flash('success', 'Document rejected successfully!');
    res.redirect('/verification/pending');
  } catch (err) {
    console.error("Error rejecting document:", err);
    req.flash('error', 'Error rejecting document');
    res.redirect('/verification/pending');
  }
});




module.exports = router;
