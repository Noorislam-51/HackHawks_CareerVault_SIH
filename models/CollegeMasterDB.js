const mongoose = require("mongoose");

// Master Document Schema
const masterDocumentSchema = new mongoose.Schema({
  category: { type: String, required: true },
  title: { 
    type: String, 
    required: true,
    set: v => v.trim().replace(/\s+/g, "_").toLowerCase()  // normalize
  },
  file_url: { type: String },
  issueDate: { type: Date }
});

// Master Student Schema
const masterStudentSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  fullName: { 
    type: String, 
    required: true, 
    set: v => v.trim().split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ")
  },
  documents: [masterDocumentSchema]
}, { timestamps: true });

const MasterStudent = mongoose.model("MasterStudent", masterStudentSchema);
module.exports = MasterStudent;
