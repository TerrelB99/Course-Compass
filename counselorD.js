
function loadStudentApplications() {
    const counselorData = sessionStorage.getItem("counselor");
    const counselor = counselorData ? JSON.parse(counselorData) : null;

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

            let appList = "<ul>";
            applications.forEach((app, index) => {
                const detailId = `app-details-${student._id}-${index}`;
                const mailtoLink = `mailto:${app.email}`;
                appList += `
                    <li>
                        <strong>${app.jobTitle}</strong> - ${app.status}
                        <button style="background-color:#007bff; color:#fff; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:0.9rem; transition:background-color 0.2s ease;" style='margin-right: 8px;' onmouseover="this.style.backgroundColor='#0056b3'" onmouseout="this.style.backgroundColor='#007bff'" onclick="toggleDetails('${detailId}')">🔽</button>
                        <button style="background-color:#007bff; color:#fff; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:0.9rem; transition:background-color 0.2s ease;" style='margin-left: 8px;' onmouseover="this.style.backgroundColor='#0056b3'" onmouseout="this.style.backgroundColor='#007bff'" onclick="window.location.href='${mailtoLink}'">📧</button>
                        <div id="${detailId}" style="display:none; margin-top: 0.5rem;">
                            <strong>Email:</strong> ${app.email}<br/>
                            ${app.skills?.length ? `<strong>Skills:</strong> ${app.skills.join(", ")}<br/>` : ""}
                            ${app.resume ? `<a href="${app.resume}" target="_blank">📄 View Resume</a><br/>` : ""}
                            <em>Applied on: ${new Date(app.appliedAt).toLocaleDateString()}</em>
                        </div>
                    </li>
                `;
            });
            appList += "</ul>";

            card.innerHTML = `
                <div>
                    <h3>${student.firstname || "N/A"} ${student.lastname || "N/A"}</h3>
                    <p><strong>Username:</strong> ${student.username || "N/A"}</p>
                    <p><strong>Major:</strong> ${student.major || "N/A"}</p>
                    <p><strong>University:</strong> ${student.university || "N/A"}</p>
                    <h4>Applications:</h4>
                    ${applications.length === 0 ? "<p>No applications submitted.</p>" : appList}
                </div>
            `;

            container.appendChild(card);
        });

        document.querySelector(".dashboard-content").appendChild(container);
    }
}

function toggleDetails(id) {
    const element = document.getElementById(id);
    if (element) {
        element.style.display = (element.style.display === "none") ? "block" : "none";
    }
}
