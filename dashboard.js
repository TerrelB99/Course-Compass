document.addEventListener("DOMContentLoaded", async () => {
    const cardGrid = document.querySelector(".card-grid");
    const addJobModal = document.getElementById("add-job-modal");
    const addJobForm = document.getElementById("add-job-form");
    const modalOverlay = document.getElementById("modal-overlay");
    const applicantsModal = document.getElementById("applicants-modal");

    // Function to fetch and display jobs
    async function renderJobs() {
        try {
            const response = await fetch('/jobs');
            const jobs = await response.json();

            cardGrid.innerHTML = `<div id="add-new-job-btn" class="add-job-card">+ Add New Job</div>`;

            jobs.forEach((job) => {
                const card = document.createElement("div");
                card.className = "card";
                card.innerHTML = `
                    <div class="card-header">${job.jobTitle}</div>
                    <div class="card-content">
                        <p><strong>Company:</strong> ${job.company}</p>
                        <p><strong>Location:</strong> ${job.location}</p>
                        <p><strong>Salary:</strong> $${job.salary.toLocaleString()}</p>
                        <p><strong>Description:</strong> ${job.description}</p>
                        <p><strong>Skills:</strong> ${job.skillsRequired.join(', ')}</p>
                        <button class="view-applicants" data-job-id="${job._id}" data-job-title="${job.jobTitle}">View Applicants</button>
                        <button class="delete-job" data-job-id="${job._id}">Delete Job</button>
                    </div>
                `;
                cardGrid.appendChild(card);
            });

            // View Applicants Functionality
            document.querySelectorAll('.view-applicants').forEach((button) => {
                button.addEventListener('click', async (e) => {
                    const jobId = e.target.dataset.jobId;
                    const jobTitle = e.target.dataset.jobTitle;

                    try {
                        const response = await fetch(`/jobs/${jobId}/applicants`);
                        if (!response.ok) throw new Error('Failed to fetch applicants');
                        const applicants = await response.json();

                        applicantsModal.innerHTML = `
                            <h2>Applicants for ${jobTitle}</h2>
                            <ul>
                                ${applicants.length > 0 ? applicants.map(a => `
                                    <li>
                                        <strong>Name:</strong> ${a.firstName || 'N/A'} ${a.lastName || 'N/A'} <br>
                                        <strong>Email:</strong> ${a.email || 'N/A'} <br>
                                        <strong>Phone:</strong> ${a.phoneNumber || 'N/A'} <br>
                                        <strong>Address:</strong> ${a.address || 'N/A'} <br>
                                        <strong>Skills:</strong> ${a.skills || 'N/A'} <br>
                                        <strong>Race:</strong> ${a.race || 'N/A'} <br>
                                        <strong>Resume:</strong> ${a.resume ? `<a href="${a.resume}" target="_blank" download>Download</a>` : 'N/A'} <br>
                                        <button class="delete-application" data-job-id="${jobId}" data-applicant-id="${a._id}">Delete Application</button>
                                    </li>
                                    <hr>
                                `).join('') : '<p>No applicants yet.</p>'}
                            </ul>
                            <button id="close-modal">Close</button>
                        `;

                        applicantsModal.style.display = "block";
                        modalOverlay.style.display = "block";

                        document.getElementById('close-modal').addEventListener('click', () => {
                            applicantsModal.style.display = "none";
                            modalOverlay.style.display = "none";
                        });

                        // Attach event listeners for deleting applications
                        document.querySelectorAll(".delete-application").forEach(button => {
                            button.addEventListener("click", async (e) => {
                                const jobId = e.target.dataset.jobId;
                                const applicantId = e.target.dataset.applicantId;

                                if (confirm("Are you sure you want to delete this application?")) {
                                    try {
                                        const deleteResponse = await fetch(`/jobs/${jobId}/applicants/${applicantId}`, {
                                            method: "DELETE"
                                        });

                                        if (deleteResponse.ok) {
                                            alert("Application deleted successfully.");
                                            e.target.parentElement.remove(); // Remove from UI
                                        } else {
                                            throw new Error("Failed to delete application.");
                                        }
                                    } catch (error) {
                                        console.error("Error deleting application:", error);
                                    }
                                }
                            });
                        });

                    } catch (error) {
                        console.error('Error fetching applicants:', error);
                        alert("Error loading applicants.");
                    }
                });
            });

            // Delete Job Functionality
            document.querySelectorAll('.delete-job').forEach((button) => {
                button.addEventListener('click', async (e) => {
                    const jobId = e.target.dataset.jobId;
                    if (confirm('Are you sure you want to delete this job?')) {
                        try {
                            const response = await fetch(`/jobs/${jobId}`, { method: 'DELETE' });
                            if (response.ok) {
                                alert('Job deleted successfully!');
                                renderJobs();
                            } else {
                                throw new Error('Failed to delete job');
                            }
                        } catch (error) {
                            console.error('Error deleting job:', error);
                            alert("Failed to delete job.");
                        }
                    }
                });
            });

        } catch (error) {
            console.error('Error fetching jobs:', error);
        }
    }

    // Close Add Job Modal
    document.getElementById("cancel-add-job").addEventListener("click", () => {
        addJobModal.style.display = "none";
        modalOverlay.style.display = "none";
    });

    // Handle Add Job Submission
    addJobForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const jobData = {
            jobTitle: document.getElementById("job-title").value,
            company: document.getElementById("job-company").value,
            description: document.getElementById("job-description").value,
            location: document.getElementById("job-location").value,
            salary: document.getElementById("job-salary").value,
            skillsRequired: document.getElementById("job-skills").value.split(","),
            jobLink: document.getElementById("job-link").value
        };

        try {
            const response = await fetch('/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jobData)
            });

            if (response.ok) {
                alert("Job posted successfully!");
                addJobModal.style.display = "none";
                modalOverlay.style.display = "none";
                renderJobs();
            } else {
                throw new Error("Error adding job");
            }
        } catch (error) {
            console.error(error);
            alert("Error adding job.");
        }
    });

    renderJobs();
});
