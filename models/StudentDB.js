const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/SIH_Project");

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true, set: v => v.trim().replace(/\s+/g, "_").toLowerCase() },
  type: { type: String, required: true },
  file_url: { type: String, required: true },
  verified: { type: Boolean, default: false },
  upload_date: { type: Date, required: true },
  staff_comments: { type: String, default: "" }
});

const attendanceSchema = new mongoose.Schema({
  month: { type: String, required: true }, // format: "2025-09"
  totalDays: { type: Number, default: 0 },
  presentDays: { type: Number, default: 0 }
});
// ✅ New SPI Schema
const spiSchema = new mongoose.Schema({
  semester: { type: Number, required: true },
  spi: { type: Number, required: true }
});
const cardsSchema = new mongoose.Schema({
  academic_achievements: [documentSchema],
  conferences_workshops: [documentSchema],
  certifications_earned: [documentSchema],
  club_activities_volunteering: [documentSchema],
  competitions_contests: [documentSchema],
  leadership_roles_internships: [documentSchema],
  community_services: [documentSchema],
  general_supporting_documents: [documentSchema],
  others_documents: [documentSchema]
});

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  collegeId: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  basicDetails: {
    fullName: {
      type: String, required: true,
      set: v => v.trim().split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ")
    },
    dob: { type: Date },
    course: { type: String },
    year: { type: Number },
    contact: { type: String },
    address: { type: String }
  },
  skills: { type: [String], default: [] },
  cards: { type: cardsSchema, default: {} },
  spi: { type: [spiSchema], default: [] },
  attendance: { type: [attendanceSchema], default: [] }

}, { timestamps: true });

studentSchema.plugin(plm, { usernameField: 'studentId' });
const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
