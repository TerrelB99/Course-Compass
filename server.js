const express = require('express');
const bcrypt = require("bcryptjs"); // ✅ Import bcryptjs
const router = express.Router(); // ✅ Fix: Define the router
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(__dirname));

// MongoDB Connection String
const uri = "mongodb+srv://tbrown12354:SGoku1932@coursecompass.lespq.mongodb.net/?retryWrites=true&w=majority&appName=CourseCompass";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let database, studentsCollection, recruitersCollection, jobsCollection, counselorsCollection, adminsCollection;

async function connectDB() {
    try {
        await client.connect();
        database = client.db("CourseCompass");
        studentsCollection = database.collection("students");
        recruitersCollection = database.collection("recruiters");
        jobsCollection = database.collection("jobs");
        counselorsCollection = database.collection("counselors");
        adminsCollection = database.collection("admins");
        console.log("✅ Successfully connected to MongoDB!");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
    }
}
connectDB();

// Serve the login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'welcome.html'));
});

// ✅ **Student Sign-In Route**
app.post('/student/signin', async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log("🔍 Searching for student username:", username);

        if (!studentsCollection) {
            return res.status(500).json({ message: "Database connection not established" });
        }

        const student = await studentsCollection.findOne({ username });

        if (!student || student.password !== password) {
            console.log(`❌ Invalid credentials for student: ${username}`);
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        console.log(`🎉 Student login successful for: ${username}`);
        res.status(200).json({ userType: "student", user: student });
    } catch (err) {
        console.error("❌ Error during student sign-in:", err.message);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// ✅ **Recruiter Sign-In Route**
app.post('/recruiter/signin', async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log("🔍 Searching for recruiter username:", username);

        if (!recruitersCollection) {
            return res.status(500).json({ message: "Database connection not established" });
        }

        const recruiter = await recruitersCollection.findOne({ username });

        if (!recruiter || recruiter.password !== password) {
            console.log(`❌ Invalid credentials for recruiter: ${username}`);
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        console.log(`🎉 Recruiter login successful for: ${username}`);
        res.status(200).json({ userType: "recruiter", user: recruiter });
    } catch (err) {
        console.error("❌ Error during recruiter sign-in:", err.message);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// ✅ **Recruiter Posts a Job**
const { v4: uuidv4 } = require('uuid'); // Import UUID library at the top

app.post('/jobs', async (req, res) => {
    try {
        const { jobTitle, company, location, salary, description, skillsRequired, recruiterID } = req.body;

        if (!jobTitle || !company || !location || !salary || !description || !skillsRequired || !recruiterID) {
            console.error("❌ Missing fields in job data:", req.body);
            return res.status(400).json({ message: "All fields are required" });
        }

        const newJob = {
            jobId: uuidv4(),  // ✅ Generate a unique jobId
            jobTitle,
            company,
            location,
            salary: Number(salary),  // Ensure salary is a number
            description,
            skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : skillsRequired.split(","),
            recruiterID,
            postedDate: new Date(),
            applicants: []
        };

        const result = await jobsCollection.insertOne(newJob);
        console.log("✅ Job posted successfully:", result.insertedId);

        res.status(201).json({ message: "Job posted successfully!", jobId: newJob.jobId });
    } catch (error) {
        console.error("❌ Error posting job:", error);
        res.status(500).json({ message: "Error posting job", error: error.message });
    }
});



// ✅ Get All Jobs (Visible to Students)
app.get('/jobs', async (req, res) => {
    try {
        const jobs = await jobsCollection.find().toArray();
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: "Error fetching jobs", error: error.message });
    }
});

// ✅ Get Jobs Posted by Specific Recruiter
app.get('/jobs/recruiter/:recruiterID', async (req, res) => {
    const { recruiterID } = req.params;

    try {
        const jobs = await jobsCollection.find({ recruiterID }).toArray();
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: "Error fetching recruiter's jobs", error: error.message });
    }
});

// ✅ **Student Applies for a Job**
app.post('/jobs/:jobID/apply', async (req, res) => {
    try {
        const { jobID } = req.params;
        const { studentID, firstName, lastName, email, phone, skills, address, resume } = req.body;

        if (!studentID || !firstName || !lastName || !email) {
            return res.status(400).json({ message: "Missing required application details" });
        }

        // Find the job by jobId
        const job = await jobsCollection.findOne({ jobId: jobID });
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        const application = {
            studentID,
            firstName,
            lastName,
            email,
            phone,
            skills: skills ? skills.split(",") : [],
            address,
            resume,
            appliedAt: new Date(),
            status: "Pending"
        };

        // Update job applicants list
        await jobsCollection.updateOne(
            { jobId: jobID },
            { $push: { applicants: application } }
        );

        res.status(200).json({ message: "Application submitted successfully!" });
    } catch (error) {
        console.error("Error submitting application:", error);
        res.status(500).json({ message: "Error submitting application", error: error.message });
    }
});


// Allow Recruiters to Send Notifications
router.post('/send', async (req, res) => {
    try {
        const { recruiterID, studentID, message } = req.body;

        // Find the student in the database
        const student = await studentsCollection.findOne({ studentId: studentID });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Create the notification object
        const notification = {
            senderID: recruiterID,
            senderType: "Recruiter",
            message,
            timestamp: new Date(),
            replies: []
        };

        // Update the student's notifications array
        await studentsCollection.updateOne(
            { studentId: studentID },
            { $push: { notifications: notification } }
        );

        res.status(200).json({ message: "Notification sent successfully!" });
    } catch (error) {
        console.error("❌ Error sending notification:", error);
        res.status(500).json({ message: "Error sending notification" });
    }
});



// ✅ **Recruiter Sends Notification to Student**
app.post('/notifications', async (req, res) => {
    const { studentID, recruiterName, message } = req.body;

    try {
        const student = await studentsCollection.findOne({ _id: new ObjectId(studentID) });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        student.notifications = student.notifications || [];
        student.notifications.push({ recruiterName, message, timestamp: new Date(), status: "unread" });

        await studentsCollection.updateOne({ _id: new ObjectId(studentID) }, { $set: { notifications: student.notifications } });

        res.status(201).json({ message: "Notification sent successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error sending notification", error: error.message });
    }
});


// ✅ **Get Student Notifications**
app.get('/notifications/:studentID', async (req, res) => {
    const { studentID } = req.params;

    try {
        const student = await studentsCollection.findOne({ _id: new ObjectId(studentID) });

        if (!student || !student.notifications) {
            return res.status(404).json({ message: "No notifications found" });
        }

        res.status(200).json(student.notifications);
    } catch (error) {
        res.status(500).json({ message: "Error fetching notifications", error: error.message });
    }
});

// ✅ **Get Applicants for a Job**
app.get('/jobs/:jobID/applicants', async (req, res) => {
    const { jobID } = req.params;

    try {
        const job = await jobsCollection.findOne({ _id: new ObjectId(jobID) });

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        res.status(200).json(job.applicants);
    } catch (error) {
        res.status(500).json({ message: "Error fetching applicants", error: error.message });
    }
});

// Sign-in endpoint for counselors
app.post('/counselor/signin', async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log("🔍 Searching for counselor username:", username);

        if (!counselorsCollection) {
            return res.status(500).json({ message: "Database connection not established" });
        }

        // Search for the counselor in the counselors collection (case-insensitive)
        const counselor = await counselorsCollection.findOne({ username });

        if (!counselor) {
            console.log(`❌ Counselor not found: ${username}`);
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        console.log(`🔍 Stored password in DB: "${counselor.password}"`);
        console.log(`🔍 Entered password: "${password}"`);

        // Ensure the stored password matches exactly with the entered password
        if (counselor.password !== password) {
            console.log(`❌ Incorrect password for: ${username}`);
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        console.log(`🎉 Login successful for: ${username}`);
        res.status(200).json({ counselor });
    } catch (err) {
        console.error("❌ Error during counselor sign-in:", err.message);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

app.get('/counselors', async (req, res) => {
    try {
        if (!counselorsCollection) {
            return res.status(500).json({ message: "Database connection not established" });
        }

        const counselors = await counselorsCollection.find({}).toArray();
        res.status(200).json(counselors);
    } catch (error) {
        console.error("❌ Error fetching counselors:", error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// ✅ **Counselor Signup Route**
app.post('/counselor/signup', async (req, res) => {
    try {
        console.log("🔍 Received data:", req.body);

        const { firstname, lastname, username, password, major, company } = req.body;

        if (!firstname || !lastname || !username || !password || !major) {
            console.error("❌ Missing required fields:", req.body);
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!counselorsCollection) {
            console.error("❌ Database connection not established");
            return res.status(500).json({ message: "Database connection error" });
        }

        const existingCounselor = await counselorsCollection.findOne({ username });
        if (existingCounselor) {
            return res.status(400).json({ message: "Username already exists" });
        }


        // Create the counselor object (without counselorId)
        const newCounselor = {
            firstname,
            lastname,
            username,
            password,
            major,
            company: company || "",
            createdAt: new Date()
        };

        await counselorsCollection.insertOne(newCounselor);
        res.status(201).json({ message: "Signup successful!" });
    } catch (error) {
        console.error("❌ Error during counselor signup:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// ✅ **Admin Signup Route (Fixed)**
app.post('/admin/signup', async (req, res) => {
    try {
        console.log("🔍 Received data:", req.body);

        const { firstname, lastname, username, password } = req.body;

        if (!firstname || !lastname || !username || !password) {
            console.error("❌ Missing required fields:", req.body);
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!adminsCollection) {
            console.error("❌ Database connection not established");
            return res.status(500).json({ message: "Database connection error" });
        }

        const existingAdmin = await adminsCollection.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // ✅ Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new admin document
        const newAdmin = {
            firstname,
            lastname,
            username,
            password: hashedPassword, // ✅ Store hashed password
            createdAt: new Date()
        };

        await adminsCollection.insertOne(newAdmin);
        res.status(201).json({ message: "Admin registered successfully!" });
    } catch (error) {
        console.error("❌ Error during admin signup:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// ✅ **Admin Sign-In Route (Fixed)**
app.post('/admin/signin', async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log("🔍 Searching for admin username:", username);

        if (!adminsCollection) {
            return res.status(500).json({ message: "Database connection not established" });
        }

        // Search for the admin in the database
        const admin = await adminsCollection.findOne({ username });

        if (!admin) {
            console.log(`❌ Admin not found: ${username}`);
            return res.status(400).json({ message: "Invalid username or password" });
        }

        // ✅ Compare entered password with stored hashed password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            console.log(`❌ Incorrect password for: ${username}`);
            return res.status(400).json({ message: "Invalid username or password" });
        }

        console.log(`🎉 Admin login successful for: ${username}`);
        res.status(200).json({ admin });
    } catch (err) {
        console.error("❌ Error during admin sign-in:", err.message);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});

app.get('/admin/users', async (req, res) => {
    try {
        if (!studentsCollection || !recruitersCollection || !counselorsCollection) {
            return res.status(500).json({ message: "Database connection not established" });
        }

        const students = await studentsCollection.find().toArray();
        const recruiters = await recruitersCollection.find().toArray();
        const counselors = await counselorsCollection.find().toArray();

        const users = [
            ...students.map(user => ({ ...user, role: "Student" })),
            ...recruiters.map(user => ({ ...user, role: "Recruiter" })),
            ...counselors.map(user => ({ ...user, role: "Counselor" }))
        ];

        res.status(200).json(users);
    } catch (error) {
        console.error("❌ Error fetching users:", error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

app.delete('/admin/delete/:role/:id', async (req, res) => {
    const { role, id } = req.params;

    let collection;
    switch (role) {
        case "student":
            collection = studentsCollection;
            break;
        case "recruiter":
            collection = recruitersCollection;
            break;
        case "counselor":
            collection = counselorsCollection;
            break;
        default:
            return res.status(400).json({ message: "Invalid role" });
    }

    try {
        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully!" });
    } catch (error) {
        console.error("❌ Error deleting user:", error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

app.get('/admin/user/:role/:id', async (req, res) => {
    const { role, id } = req.params;

    let collection;
    switch (role) {
        case "student":
            collection = studentsCollection;
            break;
        case "recruiter":
            collection = recruitersCollection;
            break;
        case "counselor":
            collection = counselorsCollection;
            break;
        default:
            return res.status(400).json({ message: "Invalid role" });
    }

    try {
        const user = await collection.findOne({ _id: new ObjectId(id) });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("❌ Error fetching user details:", error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// Start the server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
