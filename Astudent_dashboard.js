document.addEventListener("DOMContentLoaded", async () => {
    const studentTableBody = document.getElementById("studentTableBody");
    const studentCount = document.getElementById("studentCount");

    async function fetchStudents() {
        try {
            const response = await fetch('http://localhost:3000/students'); // Ensure this API is working
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
            <td><input type="text" value="${student.firstname}" data-id="${student.id}" class="edit-firstname"></td>
            <td><input type="text" value="${student.lastname}" data-id="${student.id}" class="edit-lastname"></td>
            <td><input type="text" value="${student.username}" data-id="${student.id}" class="edit-username"></td>
            <td>
                <input type="password" value="${student.password}" readonly>
                <span class="eye-icon" onclick="togglePasswordVisibility(event)">👁️</span>
            </td>
            <td>
                <button class="save-btn" data-id="${student.id}">Save</button>
                <button class="delete-btn" data-id="${student.id}">Delete</button>
            </td>
        `;

            studentTableBody.appendChild(row);
        });

        attachEventListeners();
    }
    async function updateStudent(id, updatedData) {
        try {
            const response = await fetch(`http://localhost:3000/students/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) throw new Error("Failed to update student");

            alert("Student updated successfully!");
            fetchStudents(); // Refresh list
        } catch (error) {
            console.error("Error updating student:", error);
        }
    }

    async function deleteStudent(id) {
        try {
            const response = await fetch(`http://localhost:3000/students/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete student");

            alert("Student deleted successfully!");
            fetchStudents(); // Refresh list
        } catch (error) {
            console.error("Error deleting student:", error);
        }
    }

    function attachEventListeners() {
        document.querySelectorAll(".save-btn").forEach(button => {
            button.addEventListener("click", async (event) => {
                const id = event.target.dataset.id;
                const firstname = document.querySelector(`.edit-firstname[data-id='${id}']`).value;
                const lastname = document.querySelector(`.edit-lastname[data-id='${id}']`).value;
                const username = document.querySelector(`.edit-username[data-id='${id}']`).value;

                await updateStudent(id, { firstname, lastname, username });
            });
        });

        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", async (event) => {
                const id = event.target.dataset.id;
                if (confirm("Are you sure you want to delete this student?")) {
                    await deleteStudent(id);
                }
            });
        });
    }


    fetchStudents();
});
