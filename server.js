const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const MONGO_URI = "mongodb+srv://tbrown12354:SGoku1932@coursecompass.lespq.mongodb.net/coursecompass?retryWrites=true&w=majority";

app.use(express.json());
app.use(cors());

// Serve static files
app.use(express.static(__dirname));

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Import routes
const authRoutes = require('./auth_routes');
app.use('/auth', authRoutes);  // This ensures the `/auth/students/signin` route exists

// Serve signin.html as the default page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'signin.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
