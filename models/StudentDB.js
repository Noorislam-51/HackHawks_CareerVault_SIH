const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/SIH_Project");

// Document schema for different cards
const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true },
  file_url: { type: String, required: true },
  verified: { type: Boolean, default: false },
  upload_date: { type: Date, required: true },
  staff_comments: { type: String, default: "" }
});
// Cards schema
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
    fullName: { type: String, required: true },
    dob: { type: Date },             // optional if not in form
    course: { type: String },        // optional if not in form
    year: { type: Number },          // optional if not in form
    contact: { type: String },
    address: { type: String }         // optional if not in form
  },
  // skills: { type: [String], default: [] },
  cards: { type: cardsSchema, default: {} } // 👈 now active
}, { timestamps: true });


studentSchema.plugin(plm, { usernameField: 'studentId' });
const Student = mongoose.model("Student", studentSchema);

module.exports = Student;