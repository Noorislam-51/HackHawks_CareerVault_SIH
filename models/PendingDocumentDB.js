const mongoose = require("mongoose");


// Pending Document Schema
const pendingDocumentSchema = new mongoose.Schema({
  studentId: { type: String, required: true }, // link with student
  title: { type: String, required: true },
  type: { type: String, required: true },
  file_url: { type: String, required: true },
  upload_date: { type: Date, default: Date.now },
  status: { type: String, default: "pending" }, // pending | rejected | approved
  staff_comments: { type: String, default: "" }
}, { timestamps: true });
const PendingDocument = mongoose.model("PendingDocument", pendingDocumentSchema);

module.exports = PendingDocument;
