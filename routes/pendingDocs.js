  const express = require("express");
const multer = require("multer");
const path = require("path");
const PendingDocument = require("../models/PendingDocumentDB");

const router = express.Router();

// Storage setup (files stored in /public/images/uploads folder)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/images/uploads")); 
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
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


module.exports = router;
