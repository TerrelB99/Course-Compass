document.addEventListener("DOMContentLoaded", () => {
    const counselorData = sessionStorage.getItem("counselor");
    const counselor = counselorData ? JSON.parse(counselorData) : null;

    const universitySelect = document.getElementById("universityFilter");

    // Fetch all unique universities
    fetch("/students/universities")
        .then(res => res.json())
        .then(universities => {
            universities.forEach(u => {
                const option = document.createElement("option");
                option.value = u;
                option.textContent = u;
                universitySelect.appendChild(option);
            });

            // Optional: auto-select counselor's university
            if (counselor?.university) {
                universitySelect.value = counselor.university;
                universitySelect.dispatchEvent(new Event("change"));
            }
        });

    universitySelect.addEventListener("change", () => {
        const university = universitySelect.value;
        if (!university) return;

        fetch(`/counselor/students/university-applications?university=${encodeURIComponent(university)}`)
            .then(res => res.json())
            .then(data => displayStudents(data))
            .catch(err => {
                console.error("Error fetching student data:", err);
                alert("Failed to load student data.");
            });
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
                    ${
                applications.length === 0
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

        const prev = document.querySelector(".dashboard-content .results");
        if (prev) prev.remove();

        container.classList.add("results");
        document.querySelector(".dashboard-content").appendChild(container);
    }
});
