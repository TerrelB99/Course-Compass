document.addEventListener("DOMContentLoaded", async () => {
    async function fetchStudents() {
        try {
            const response = await fetch('http://localhost:3000/students');
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
        const studentTable = document.getElementById("studentTable");
        studentTable.innerHTML = "";

        students.forEach(student => {
            const row = document.createElement("tr");
            const fullName = `${student.firstName} ${student.lastName}`;
            const status = student.active ? "Active" : "Inactive";

            row.innerHTML = `
                <td>${fullName}</td>
                <td>${student.username}</td>
                <td>${status}</td>
                <td class="actions">
                    <button onclick="toggleActivation('${student._id}', ${student.active})">
                        ${student.active ? "Deactivate" : "Activate"}
                    </button>
                </td>
            `;
            studentTable.appendChild(row);
        });
    }

    window.toggleActivation = async function (studentId, isActive) {
        try {
            const response = await fetch(`http://localhost:3000/students/${studentId}/toggle`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ active: !isActive })
            });

            if (response.ok) {
                alert(`Student account ${!isActive ? "activated" : "deactivated"}`);
                fetchStudents();
            } else {
                alert("Failed to update account status.");
            }
        } catch (error) {
            console.error("Activation error:", error);
        }
    };

    fetchStudents(); // Don't forget to trigger this on page load!
});
