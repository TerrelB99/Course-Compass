const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(__dirname));

// MongoDB Connection String with Credentials
const uri = "mongodb+srv://tbrown12354:SGoku1932@coursecompass.lespq.mongodb.net/?retryWrites=true&w=majority&appName=CourseCompass";

// Create a MongoClient with Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let studentsCollection;

// Connect to MongoDB and initialize the `students` collection
async function connectDB() {
    try {
        await client.connect();
        console.log("✅ Successfully connected to MongoDB!");

        // Set reference to the students collection
        const database = client.db("CourseCompass");
        studentsCollection = database.collection("students");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
    }
}
connectDB();

// Serve the login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'welcome.html'));
});

// Sign-in endpoint
app.post('/student/signin', async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log("🔍 Searching for username:", username);

        if (!studentsCollection) {
            return res.status(500).json({ message: "Database connection not established" });
        }

        // Search for the user in the students collection (case-insensitive)
        const student = await studentsCollection.findOne({ username });

        if (!student) {
            console.log(`❌ User not found: ${username}`);
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        console.log(`🔍 Stored password in DB: "${student.password}"`);
        console.log(`🔍 Entered password: "${password}"`);

        // Ensure the stored password matches exactly with the entered password
        if (student.password !== password) {
            console.log(`❌ Incorrect password for: ${username}`);
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        console.log(`🎉 Login successful for: ${username}`);
        res.status(200).json({ student });
    } catch (err) {
        console.error("❌ Error during sign-in:", err.message);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

const cors = require('cors');
app.use(cors()); // Enable CORS for frontend requests

// Endpoint to fetch all students
app.get('/students', async (req, res) => {
    try {
        if (!studentsCollection) {
            return res.status(500).json({ message: "Database connection not established" });
        }

        const students = await studentsCollection.find({}).toArray();
        res.status(200).json(students);
    } catch (error) {
        console.error("❌ Error fetching students:", error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
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

// Start the server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));