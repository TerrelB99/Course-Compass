
document.addEventListener("DOMContentLoaded", () => {
    const counselorData = sessionStorage.getItem("counselor");
    const counselor = counselorData ? JSON.parse(counselorData) : null;



    // Default university to counselor's associated one, or prompt
    const university = prompt("Enter the university to search for prospective students:");

    if (!university) {
        alert("University is required to view students.");
        return;
    }

    fetch(`/counselor/students/university-applications?university=${encodeURIComponent(university)}`)
        .then(res => res.json())
        .then(data => displayStudents(data))
        .catch(err => {
            console.error("Error fetching student data:", err);
            alert("Failed to load student data.");
        });

    function displayStudents(studentsWithApplications) {
        const container = document.createElement("div");
        container.style.marginTop = "2rem";

        studentsWithApplications.forEach(({ student, applications }) => {
            const card = document.createElement("div");
            card.className = "dashboard-card";
            card.innerHTML = `
    <div>
        <h3>${student.firstname || "N/A"} ${student.lastname || "N/A"}</h3>
        <p><strong>Username:</strong> ${student.username || "N/A"}</p>
        <p><strong>Major:</strong> ${student.major || "N/A"}</p>
        <p><strong>University:</strong> ${student.university || "N/A"}</p>
        <h4>Applications:</h4>
        ${applications.length === 0
                ? "<p>No applications submitted.</p>"
                : "<ul>" + applications.map(app => `
                <li>
                    <strong>${app.jobTitle}</strong> at ${app.company}<br/>
                    <strong>Status:</strong> ${app.status}<br/>
                    <strong>Email:</strong> ${app.email}<br/>
                    ${app.skills?.length ? `<strong>Skills:</strong> ${app.skills.join(", ")}` : ""}
                    ${app.resume ? `<br/><a href="${app.resume}" target="_blank">📄 View Resume</a>` : ""}
                    <br/><em>Applied on: ${new Date(app.appliedAt).toLocaleDateString()}</em>
                </li>

            `).join("") + "</ul>"
            }
    </div>
`;

            container.appendChild(card);
        });

        document.querySelector(".dashboard-content").appendChild(container);
    }
});
