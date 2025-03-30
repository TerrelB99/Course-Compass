const express = require('express');
const router = express.Router(); // ✅ Fix: Define the router
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(__dirname, {
    index: false // disables automatic serving of index.html
}));


// MongoDB Connection String
const uri = "mongodb+srv://tbrown12354:SGoku1932@coursecompass.lespq.mongodb.net/?retryWrites=true&w=majority&appName=CourseCompass";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let database, studentsCollection, recruitersCollection, jobsCollection;

async function connectDB() {
    try {
        await client.connect();
        database = client.db("CourseCompass");
        studentsCollection = database.collection("students");
        recruitersCollection = database.collection("recruiters");
        jobsCollection = database.collection("jobs");
        messagesCollection = database.collection("messages");
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

app.post("/student/signup", async (req, res) => {
    try {
        const { firstName, lastName, email, username, password, university } = req.body;

        if (!firstName || !lastName || !email || !username || !password || !university) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const existing = await studentsCollection.findOne({ username });
        if (existing) {
            return res.status(409).json({ message: "Username already exists." });
        }

        const newStudent = {
            firstName,
            lastName,
            email,
            username,
            password,
            university,
            appliedJobs: [],
            isActive: true
        };

        const result = await studentsCollection.insertOne(newStudent);

        if (result.acknowledged) {
            res.status(201).json({ message: "Signup successful!" });
        } else {
            res.status(500).json({ message: "Failed to register student." });
        }
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Internal server error." });
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

app.post("/recruiter/signup", async (req, res) => {
    try {
        const { firstName, lastName, email, username, password, company } = req.body;

        if (!firstName || !lastName || !email || !username || !password || !company) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const existing = await recruitersCollection.findOne({ username });
        if (existing) {
            return res.status(409).json({ message: "Username already exists." });
        }

        const newRecruiter = {
            firstName,
            lastName,
            email,
            username,
            password,
            company,
            jobsPosted: [],
            isActive: true
        };

        const result = await recruitersCollection.insertOne(newRecruiter);

        if (result.acknowledged) {
            res.status(201).json({ message: "Recruiter signup successful!" });
        } else {
            res.status(500).json({ message: "Failed to register recruiter." });
        }
    } catch (error) {
        console.error("Recruiter signup error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// ✅ **Recruiter Posts a Job**
// ✅ UPDATED recruiter job posting with MongoDB ID and recruiter profile update
app.post('/jobs', async (req, res) => {
    try {
        const { jobTitle, company, location, salary, description, skillsRequired, recruiterID } = req.body;

        if (!jobTitle || !company || !location || !salary || !description || !skillsRequired || !recruiterID) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const newJob = {
            jobId: uuidv4(),
            jobTitle,
            company,
            location,
            salary: Number(salary),
            description,
            skillsRequired: Array.isArray(skillsRequired)
                ? skillsRequired.map(skill => skill.trim())
                : skillsRequired.split(',').map(skill => skill.trim()),
            recruiterID,
            postedDate: new Date(),
            applicants: []
        };

        const result = await jobsCollection.insertOne(newJob);
        const insertedId = result.insertedId;

        if (result.acknowledged) {
            // ✅ Update recruiter with job info
            await recruitersCollection.updateOne(
                { _id: new ObjectId(recruiterID) },
                { $push: { jobsPosted: { jobId: insertedId.toString(), jobTitle: newJob.jobTitle } } }
            );

            res.status(201).json({ message: "Job posted successfully!", job: newJob });
        } else {
            res.status(500).json({ message: "Failed to insert job into database." });
        }
    } catch (error) {
        console.error("Error posting job:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});



// API to Delete a Job
app.delete('/jobs/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;
        console.log(`Deleting job with ID: ${jobId}`);

        // Check if job exists before deleting
        const jobExists = await jobsCollection.findOne({ jobId });
        if (!jobExists) {
            return res.status(404).json({ message: "Job not found." });
        }

        const deleteResult = await jobsCollection.deleteOne({ jobId });

        if (deleteResult.deletedCount === 1) {
            console.log("Job deleted successfully.");
            res.status(200).json({ message: "Job deleted successfully!" });
        } else {
            console.error("Job deletion failed.");
            res.status(500).json({ message: "Failed to delete job from database." });
        }
    } catch (error) {
        console.error("Error deleting job:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
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

        if (!studentID || !jobID) {
            return res.status(400).json({ message: "Missing student or job ID." });
        }

        // Find the job using MongoDB ObjectId
        const job = await jobsCollection.findOne({ _id: new ObjectId(jobID) });
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Create application from form input
        const application = {
            studentID,
            firstName,
            lastName,
            email,
            phone,
            skills: skills ? skills.split(",").map(skill => skill.trim()) : [],
            address,
            resume,
            appliedAt: new Date(),
            status: "Pending"
        };

        // Append application to job's applicant list
        await jobsCollection.updateOne(
            { _id: new ObjectId(jobID) },
            { $push: { applicants: application } }
        );

        // Reference job in student's appliedJobs array
        await studentsCollection.updateOne(
            { _id: new ObjectId(studentID) },
            {
                $push: {
                    appliedJobs: {
                        jobId: jobID,
                        jobTitle: job.jobTitle
                    }
                }
            }
        );

        res.status(200).json({ message: "Application submitted successfully!" });
    } catch (error) {
        console.error("Error submitting application:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});






// ✅ Send a Message
app.post('/messages/send', async (req, res) => {
    try {
        const { senderId, receiverId, message } = req.body;

        if (!senderId || !receiverId || !message) {
            console.error("Message Error: Missing fields", { senderId, receiverId, message });
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newMessage = {
            senderId,
            receiverId,
            message,
            timestamp: new Date()
        };

        await messagesCollection.insertOne(newMessage);
        res.status(200).json({ message: "Message sent successfully!" });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Fetch Messages for a User
app.get('/messages/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const messages = await messagesCollection.find({
            $or: [{ senderId: userId }, { receiverId: userId }]
        }).sort({ timestamp: -1 }).toArray();

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.get('/jobs/:jobId/applicants', async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await jobsCollection.findOne({ _id: new ObjectId(jobID) });


        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        res.status(200).json(job.applicants || []);
    } catch (error) {
        console.error("Error fetching applicants:", error);
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
        if (!counselor || counselor.password !== password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        if (counselor.active === false) {
            return res.status(403).json({ message: "Account is deactivated. Contact admin." });
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

        const { firstname, lastname, username, password, major, university } = req.body;

        if (!firstname || !lastname || !username || !password || !major || !university) {
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
            active: "true",
            university,
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

app.patch('/admin/toggle-status/:role/:id', async (req, res) => {
    const { role, id } = req.params;
    let collection;
    if (role === "student") collection = studentsCollection;
    else if (role === "recruiter") collection = recruitersCollection;
    else if (role === "counselor") collection = database.collection("counselors");
    else return res.status(400).json({ message: "Invalid role provided." });


    try {
        const user = await collection.findOne({ _id: new ObjectId(id) });
        if (!user) return res.status(404).json({ message: "User not found" });

        const newStatus = !user.active;
        await collection.updateOne({ _id: new ObjectId(id) }, { $set: { active: newStatus } });

        res.json({ message: `User account ${newStatus ? "activated" : "deactivated"}`, active: newStatus });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

app.get('/counselor/students/matching-university', async (req, res) => {
    const { university } = req.query;

    if (!university) {
        return res.status(400).json({ message: "University parameter is required." });
    }

    try {
        const matchingStudents = await studentsCollection.find({ university }).toArray();
        res.status(200).json(matchingStudents);
    } catch (error) {
        console.error("❌ Error fetching students by university:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

app.get('/counselor/students/university-applications', async (req, res) => {
    const { university } = req.query;
    const students = await studentsCollection.find({ university }).toArray();

    if (!university) {
        return res.status(400).json({ message: "University parameter is required." });
    }

    try {
        const students = await studentsCollection.find({ university }).toArray();
        const allJobs = await jobsCollection.find().toArray();

        // Match studentID with job applicants
        const enrichedStudents = students.map(student => {
            const studentIdStr = student.studentId.toString();

            const studentApplications = allJobs
                .filter(job =>
                    job.applicants?.some(app => app.studentID === studentIdStr)
                )
                .map(job => {
                    const appData = job.applicants.find(app => app.studentID === studentIdStr);
                    return {
                        jobTitle: job.jobTitle,
                        company: job.company,
                        status: appData?.status || "Pending",
                        appliedAt: appData?.appliedAt,
                        email: appData?.email || "N/A",
                        resume: appData?.resume || null,
                        skills: appData?.skills || [] // ✅ Include skills array
                    };
                });

            return {
                student: {
                    _id: student._id,
                    firstname: student.firstname,
                    lastname: student.lastname,
                    username: student.username,
                    major: student.major,
                    university: student.university
                },
                applications: studentApplications
            };
        });




        res.json(enrichedStudents);
    } catch (error) {
        console.error("Error fetching student applications:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});



// Start the server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
