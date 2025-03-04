module.exports = router;

// notifications.js (Backend API)
const express = require('express');
const router = express.Router();

// Backend API to check if notifications route is working
router.get('/', (req, res) => {
    res.send('Notifications route working!');
});

// Add a route for fetching user notifications (Placeholder Example)
router.get('/:userID', (req, res) => {
    const { userID } = req.params;
    res.json([
        { _id: "1", senderName: "Recruiter A", message: "New job opportunity!", replies: [] },
        { _id: "2", senderName: "Admin", message: "Your profile has been approved.", replies: [] }
    ]);
});

module.exports = router;
