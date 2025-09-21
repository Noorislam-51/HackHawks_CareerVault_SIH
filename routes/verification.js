const express = require("express");
const multer = require("multer");
const path = require("path");
const MasterStudent = require("../models/CollegeMasterDB");

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

module.exports = router;
