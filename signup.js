// signup.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { Student, Recruiter, Counselor, Admin } = require('./server'); // Ensure these models exist

const roles = { student: Student, recruiter: Recruiter, counselor: Counselor, admin: Admin };

// Generic Sign-up Route
router.post('/:role', async (req, res) => {
    const { role } = req.params;
    if (!roles[role]) return res.status(400).json({ message: 'Invalid role' });

    const { firstname, lastname, username, password } = req.body;
    try {
        // Check if the username already exists before inserting
        const existingUser = await roles[role].findOne({ username }).lean();
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists. Please choose a different one.' });
        }

        // Create new user if username is unique
        const newUser = new roles[role]({
            _id: uuidv4().slice(0, 6),
            firstname,
            lastname,
            username,
            password,
        });

        await newUser.save();
        res.status(201).json({ message: `${role} signup successful!`, userId: newUser._id });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
