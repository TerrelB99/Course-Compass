const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

mongoose.connect('mongodb+srv://tbrown12354:Goku2020$@coursecompass.lespq.mongodb.net/CourseCompass', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

const StudentSchema = new mongoose.Schema({
    userID: String,
    username: { type: String, unique: true },
    password: String,
    firstname: String,
    lastname: String,
    appliedJobs: Array,
    savedJobs: Array,
    recommenderCode: String,
});

const Student = mongoose.model('Student', StudentSchema, 'Student');

async function addStudents() {
    const students = [
        {
            userID: '12345',
            username: 'jdoe',
            password: 'securepassword', // Plaintext for now
            firstname: 'John',
            lastname: 'Doe',
            appliedJobs: [],
            savedJobs: [],
            recommenderCode: '54321',
        },
        {
            userID: '12346',
            username: 'asmith',
            password: 'securepassword', // Plaintext for now
            firstname: 'Alice',
            lastname: 'Smith',
            appliedJobs: [],
            savedJobs: [],
            recommenderCode: '54322',
        },
    ];

    for (const student of students) {
        const hashedPassword = await bcrypt.hash(student.password, 10); // Hash the password
        const newStudent = new Student({
            ...student,
            password: hashedPassword,
        });

        try {
            await newStudent.save();
            console.log(`Student ${student.username} added successfully!`);
        } catch (err) {
            console.error(`Error adding student ${student.username}:`, err);
        }
    }

    mongoose.connection.close();
}

addStudents();
