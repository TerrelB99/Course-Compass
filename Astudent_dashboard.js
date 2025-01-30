document.addEventListener("DOMContentLoaded", async () => {
    const studentTableBody = document.getElementById("studentTableBody");

    async function fetchStudents() {
        try {
            const response = await fetch('http://localhost:3000/students'); // Assuming API endpoint exists
            if (!response.ok) {
                throw new Error("Failed to fetch students");
            }
            const students = await response.json();
            renderStudents(students);
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    }

    function renderStudents(students) {
        studentTableBody.innerHTML = "";
        students.forEach(student => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${student.firstname}</td>
                <td>${student.lastname}</td>
                <td>${student.username}</td>
                <td>${student.password}</td>
            `;
            studentTableBody.appendChild(row);
        });
    }

    fetchStudents();
});
