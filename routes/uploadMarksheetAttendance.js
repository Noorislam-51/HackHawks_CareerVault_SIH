const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const path = require("path");
const Student = require("../models/StudentDB");

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, "../public/images/uploadMarkAttendance")),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// Route to upload monthly attendance
router.post("/upload-attendance", upload.single("file"), async (req, res) => {
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let results = { updated: 0, notFound: [] };

    for (let row of data) {
      const { studentId, month, presentDays, totalDays } = row;
      const student = await Student.findOne({ studentId });
      if (!student) {
        results.notFound.push(studentId);
        continue;
      }

      let att = student.attendance.find((a) => a.month === month);
      if (!att) {
        student.attendance.push({ month, presentDays, totalDays });
      } else {
        att.presentDays = presentDays;
        att.totalDays = totalDays;
      }

      await student.save();
      results.updated++;
    }

    // Send plain JSON response with results
    res.send({
      success: true,
      message: `Attendance uploaded successfully. ${results.updated} records updated.`,
      notFound: results.notFound
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      message: "Error processing attendance file"
    });
  }
});
/* ===========================
   📌 Upload SPI Route
   =========================== */
router.post("/upload-spi", upload.single("file"), async (req, res) => {
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let results = { updated: 0, notFound: [] };

    for (let row of data) {
      const { studentId, semester, spi } = row; // 👈 expects studentId, semester, spi
      const student = await Student.findOne({ studentId });
      if (!student) {
        results.notFound.push(studentId);
        continue;
      }

      let spiRecord = student.spi.find((s) => s.semester === semester);
      if (!spiRecord) {
        student.spi.push({ semester, spi });
      } else {
        spiRecord.spi = spi;
      }

      await student.save();
      results.updated++;
    }

    res.send({
      success: true,
      message: `SPI uploaded successfully. ${results.updated} records updated.`,
      notFound: results.notFound
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      message: "Error processing SPI file"
    });
  }
});


module.exports = router;
