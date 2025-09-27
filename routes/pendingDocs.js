const express = require("express");
const multer = require("multer");
const path = require("path");
const PendingDocument = require("../models/PendingDocumentDB");
const Student = require("../models/StudentDB");

const router = express.Router();

// Storage setup (files stored in /public/images/uploads folder)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/images/uploads"));
  },
   filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
 
});

// Multer instance
const upload = multer({ storage });

// Upload route
router.post("/upload-doc", upload.single("file"), async (req, res) => {
  try {
    const { studentId, title, type } = req.body;

    if (!req.file) {
      return res.status(400).send("No file uploaded ❌");
    }

    const pendingDoc = new PendingDocument({
      studentId,
      title,
      type, // comes from hidden input in your form
      file_url: `/images/uploads/${req.file.filename}`,
      status: "pending"
    });

    await pendingDoc.save();

    // Redirect to dashboard or confirmation page
    res.redirect("/student/edit");
    // OR for testing: res.send("Document uploaded successfully & pending verification ✅");
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).send("Error uploading document");
  }
});


// GET: View all documents of logged-in student
router.get("/student/all-documents", async (req, res) => {
  try {
    const studentId = req.user.studentId; // get logged-in student's ID

    // Fetch all documents of this student
    const allDocs = await PendingDocument.find({ studentId }).sort({ createdAt: -1 });

    res.render("studentAllDocs", { allDocs, student: req.user });
  } catch (err) {
    console.error("Error fetching documents:", err);
    res.status(500).send("Server error");
  }
});


module.exports = router;
