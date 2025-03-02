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
    res.sendFile(path.join(__dirname, 'signin.html'));
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

// Start the server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));