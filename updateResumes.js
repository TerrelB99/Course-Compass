const mongoose = require('mongoose');
const axios = require('axios');

// MongoDB connection
mongoose
    .connect('mongodb+srv://tbrown12354:Goku2020$@coursecompass.lespq.mongodb.net/CourseCompass?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((err) => console.error('Error connecting to MongoDB:', err.message));

// Application Schema
const applicationSchema = new mongoose.Schema({
    userId: String,
    jobId: String,
    status: String,
    applicationDate: Date,
    resumeUrl: String,
    resume: String, // Base64-encoded resume data
});

const Application = mongoose.model('Application', applicationSchema);

async function updateResumes() {
    try {
        const applications = await Application.find({ resumeUrl: { $exists: true } });

        for (const application of applications) {
            if (application.resumeUrl) {
                try {
                    // Fetch the resume from the URL
                    const response = await axios.get(application.resumeUrl, { responseType: 'arraybuffer' });
                    const base64Resume = Buffer.from(response.data).toString('base64');

                    // Update the document
                    application.resume = base64Resume;
                    application.resumeUrl = undefined; // Remove the old field

                    await application.save();
                    console.log(`Updated application ID: ${application._id}`);
                } catch (error) {
                    console.error(`Failed to fetch resume for application ID: ${application._id}`, error.message);
                }
            }
        }

        console.log('Resume update process completed.');
    } catch (error) {
        console.error('Error updating resumes:', error.message);
    } finally {
        mongoose.disconnect();
    }
}

updateResumes();
