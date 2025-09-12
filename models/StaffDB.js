const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

// Staff Schema
const staffSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  staffId: { type: String, required: true, unique: true },
  designation: { type: String },
  email: { type: String, required: true, unique: true, lowercase: true },
  collegeId: { type: String, required: true },

}, { timestamps: true });

// Use staffId as login field
staffSchema.plugin(plm, { usernameField: 'staffId' });

const Staff = mongoose.model("Staff", staffSchema);

module.exports = Staff;
