const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(__dirname));

// MongoDB connection
mongoose
    .connect('mongodb+srv://tbrown12354:Goku2020$@coursecompass.lespq.mongodb.net/CourseCompass?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((err) => console.error('Error connecting to MongoDB:', err.message));

// Schemas
const studentSchema = new mongoose.Schema({
    userID: String,
    username: String,
    password: String,
    firstname: String,
    lastname: String,
    company: String, // For recruiters
    jobPosts: Array, // For recruiters
    appliedJobs: Array, // For students
    savedJobs: Array, // For students
    recommenderCode: String,
});

const jobSchema = new mongoose.Schema({
    recruiterId: String,
    jobTitle: String,
    description: String,
    location: String,
    postedDate: { type: Date, default: Date.now },
    salary: Number,
    skillsRequired: [String],
    applicants: [
        {
            userId: String,
            firstName: String,
            lastName: String,
            email: String,
            resume: String, // Base64-encoded resume
        },
    ],
    company: String,
});

const Student = mongoose.model('Student', studentSchema, 'Student');
const Job = mongoose.model('Job', jobSchema);

// Routes

// Serve welcome.html as the root page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'welcome.html'));
});

// Serve apply_job.html for application submission
app.get('/apply_job.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'apply_job.html'));
});

// Student Sign-In
app.post('/student/signin', async (req, res) => {
    const { username, password } = req.body;

    try {
        const student = await Student.findOne({ username });
        if (!student || student.password !== password) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        res.status(200).json({ student });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Recruiter Sign-In
app.post('/recruiter/signin', async (req, res) => {
    const { username, password } = req.body;

    try {
        const recruiter = await Student.findOne({ username, company: { $exists: true } });
        if (!recruiter || recruiter.password !== password) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        res.status(200).json({ recruiter });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Sign-Up (Student or Recruiter)
app.post('/signup', async (req, res) => {
    const { firstname, lastname, username, password, company, userType } = req.body;

    try {
        const existingUser = await Student.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const newUser = new Student({
            userID: new mongoose.Types.ObjectId().toString(),
            firstname,
            lastname,
            username,
            password,
            ...(userType === 'recruiter' ? { company, jobPosts: [] } : { appliedJobs: [], savedJobs: [] }),
        });

        await newUser.save();
        res.status(201).json({ message: 'Signup successful!' });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Add a Job
app.post('/jobs', async (req, res) => {
    try {
        const job = new Job(req.body);
        await job.save();
        res.status(201).json({ message: 'Job created successfully', job });
    } catch (err) {
        res.status(500).json({ message: 'Error creating job', error: err.message });
    }
});

// Fetch Jobs
app.get('/jobs', async (req, res) => {
    try {
        const jobs = await Job.find({});
        res.status(200).json(jobs);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching jobs', error: err.message });
    }
});

// Fetch Applicants for a Job
app.get('/jobs/:jobId/applicants', async (req, res) => {
    const { jobId } = req.params;

    try {
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const applicantsWithResumes = job.applicants.map(applicant => ({
            firstName: applicant.firstName,
            lastName: applicant.lastName,
            email: applicant.email,
            resume: `data:application/pdf;base64,${applicant.resume}` // If resumes are Base64 encoded
        }));

        res.status(200).json(applicantsWithResumes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching applicants', error: error.message });
    }
});

// Submit Job Application
app.post('/apply/:jobId', async (req, res) => {
    const { jobId } = req.params;
    const { firstName, lastName, email, resume } = req.body;

    try {
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        job.applicants.push({ firstName, lastName, email, resume });
        await job.save();

        res.status(201).json({ message: 'Application submitted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error submitting application', error: err.message });
    }
});

// Fetch All Students
app.get('/students', async (req, res) => {
    try {
        const students = await Student.find({}, 'userID firstname lastname username password');
        res.status(200).json(students);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching students', error: err.message });
    }
});


// Delete an applicant from a job permanently
app.delete('/jobs/:jobId/applicants/:applicantId', async (req, res) => {
    const { jobId, applicantId } = req.params;

    try {
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Remove applicant permanently
        job.applicants = job.applicants.filter(applicant => applicant._id.toString() !== applicantId);
        await job.save();

        res.status(200).json({ message: "Application permanently deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting application", error: error.message });
    }
});


// Delete a Job
app.delete('/jobs/:jobId', async (req, res) => {
    const { jobId } = req.params;

    try {
        const job = await Job.findByIdAndDelete(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        await Student.updateMany(
            { appliedJobs: { $elemMatch: { jobId } } },
            { $pull: { appliedJobs: { jobId } } }
        );

        res.status(200).json({ message: 'Job and associated applications deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting job', error: error.message });
    }
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
