const mongoose = require('mongoose');
const crypto = require('crypto');

// Function to generate a random 6-character alphanumeric ID
function generateShortId() {
    return crypto.randomBytes(3).toString('hex');
}

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://tbrown12354:Goku2020$@coursecompass.lespq.mongodb.net/CourseCompass?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((err) => console.error('❌ Error connecting to MongoDB:', err.message));

// Recruiter Schema
const recruiterSchema = new mongoose.Schema({
    recruiterId: { type: String, default: generateShortId, unique: true },
    username: { type: String, unique: true, required: true },
    password: String,
    firstname: String,
    lastname: String,
    company: String,
    jobPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }]
});
const Recruiter = mongoose.model('Recruiter', recruiterSchema);

// Student Schema with notifications
const studentSchema = new mongoose.Schema({
    studentId: { type: String, default: generateShortId, unique: true },
    username: { type: String, unique: true, required: true },
    password: String,
    firstname: String,
    lastname: String,
    appliedJobs: Array,
    notifications: [{
        notificationId: { type: String, default: generateShortId },
        message: String,
        createdAt: { type: Date, default: Date.now }
    }]
});
const Student = mongoose.model('Student', studentSchema);

// Admin Schema
const adminSchema = new mongoose.Schema({
    adminId: { type: String, default: generateShortId, unique: true },
    username: { type: String, unique: true, required: true },
    password: String,
    firstname: String,
    lastname: String
});
const Admin = mongoose.model('Admin', adminSchema);

// Counselor Schema
const counselorSchema = new mongoose.Schema({
    counselorId: { type: String, default: generateShortId, unique: true },
    username: { type: String, unique: true, required: true },
    password: String,
    firstname: String,
    lastname: String,
    university: String
});
const Counselor = mongoose.model('Counselor', counselorSchema);

// Job Schema
const jobSchema = new mongoose.Schema({
    jobId: { type: String, default: generateShortId, unique: true },
    jobTitle: String,
    description: String,
    location: String,
    salary: Number,
    skillsRequired: [String],
    company: String,
    recruiterID: String,
    postedDate: { type: Date, default: Date.now }
});
const Job = mongoose.model('Job', jobSchema);

module.exports = { Recruiter, Student, Admin, Counselor, Job };
