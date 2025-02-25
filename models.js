const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Plain text password
    firstName: String,
    lastName: String,
    studentId: String,
    appliedJobs: Array,
    notifications: Array,
});

const Student = mongoose.model("Student", studentSchema);
module.exports = { Student };
