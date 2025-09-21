const mongoose = require("mongoose");

const pendingDocumentSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  title: { type: String, required: true, set: v => v.trim().replace(/\s+/g, "_").toLowerCase() }, // normalize
  type: { type: String, required: true },
  file_url: { type: String, required: true },
  upload_date: { type: Date, default: Date.now },
  status: { type: String, default: "pending" }, // pending | rejected | approved
  staff_comments: { type: String, default: "" }
}, { timestamps: true });

const PendingDocument = mongoose.model("PendingDocument", pendingDocumentSchema);
module.exports = PendingDocument;
