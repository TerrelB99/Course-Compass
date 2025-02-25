const express = require('express');
const router = express.Router();
// recruiter.js
const { Student } = require('./admin_counselor_setup'); // Use existing model


// GET Recruiter Route
router.get('/', (req, res) => {
    res.send('Recruiter routes operational');
});

// Send Notification from Recruiter to Student
router.post('/send-notification', async (req, res) => {
    const { userID, recruiterId, recruiterName, message } = req.body;

    try {
        const student = await Student.findOne({ userID });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        student.notifications.push({
            senderId: recruiterId,
            senderName: recruiterName,
            message,
            timestamp: new Date(),
            status: "unread"
        });

        await student.save();
        res.status(201).json({ message: "Notification sent successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Error sending notification", error: err.message });
    }
});

// Fetch Notifications for Recruiter
router.get('/recruiter-notifications/:recruiterID', async (req, res) => {
    try {
        const recruiterID = req.params.recruiterID;
        const students = await Student.find({ "notifications.senderId": recruiterID });

        const recruiterNotifications = students.flatMap(student =>
            student.notifications.filter(notification => notification.senderId === recruiterID)
        );

        res.status(200).json(recruiterNotifications);
    } catch (err) {
        res.status(500).json({ message: "Error fetching notifications", error: err.message });
    }
});

// Respond to Student Notification
router.post('/send-reply', async (req, res) => {
    const { notificationId, senderId, senderName, message } = req.body;

    try {
        const student = await Student.findOne({ "notifications._id": notificationId });

        if (!student) {
            return res.status(404).json({ message: "Notification not found" });
        }

        student.notifications.forEach(notification => {
            if (notification._id.toString() === notificationId) {
                notification.replies.push({
                    senderId,
                    senderName,
                    message,
                    timestamp: new Date()
                });
            }
        });

        await student.save();
        res.status(200).json({ message: "Reply sent successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error sending reply", error: error.message });
    }
});

// Export Router
module.exports = router;
