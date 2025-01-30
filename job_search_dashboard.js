document.addEventListener("DOMContentLoaded", async () => {
    const jobCardsContainer = document.getElementById("jobCards");

    async function fetchJobs() {
        try {
            const response = await fetch('/jobs');
            const jobs = await response.json();

            jobCardsContainer.innerHTML = '';

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
                    </div>
                    <div class="card-footer">
                        <button class="apply-now" data-job-id="${job._id}">Apply Now</button>
                    </div>
                `;
                jobCardsContainer.appendChild(card);
            });

            // Apply Now Button Event Listener
            document.querySelectorAll(".apply-now").forEach(button => {
                button.addEventListener("click", (e) => {
                    const jobId = e.target.dataset.jobId;
                    openApplicationForm(jobId);
                });
            });

        } catch (error) {
            console.error('Error fetching jobs:', error);
        }
    }

    // Open Application Form Modal
    function openApplicationForm(jobId) {
        const formHtml = `
            <div class="application-form">
                <h2>Apply for Job</h2>
                <form id="applicationForm">
                    <input type="text" id="firstName" placeholder="First Name" required>
                    <input type="text" id="lastName" placeholder="Last Name" required>
                    <input type="email" id="email" placeholder="Email" required>
                    <input type="text" id="phoneNumber" placeholder="Phone Number" required>
                    <input type="text" id="address" placeholder="Address" required>
                    <input type="text" id="skills" placeholder="Skills (comma-separated)" required>
                    <select id="race" required>
                        <option value="" disabled selected>Select Race</option>
                        <option value="Asian">Asian</option>
                        <option value="Black">Black</option>
                        <option value="Hispanic">Hispanic</option>
                        <option value="Native American">Native American</option>
                        <option value="White">White</option>
                        <option value="Other">Other</option>
                    </select>
                    <label for="resume" class="resume-label">Upload Resume:</label>
                    <input type="file" id="resume" accept=".pdf,.doc,.docx" required>
                    <button type="submit">Submit</button>
                    <button type="button" id="closeApplication">Cancel</button>
                </form>
            </div>
        `;

        const modal = document.createElement("div");
        modal.className = "application-modal";
        modal.innerHTML = formHtml;
        document.body.appendChild(modal);

        // Close Modal
        document.getElementById("closeApplication").addEventListener("click", () => {
            document.body.removeChild(modal);
        });

        // Handle Job Application Submission
        document.getElementById("applicationForm").addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append("firstName", document.getElementById("firstName").value);
            formData.append("lastName", document.getElementById("lastName").value);
            formData.append("email", document.getElementById("email").value);
            formData.append("phoneNumber", document.getElementById("phoneNumber").value);
            formData.append("address", document.getElementById("address").value);
            formData.append("skills", document.getElementById("skills").value);
            formData.append("race", document.getElementById("race").value);
            formData.append("resume", document.getElementById("resume").files[0]);

            try {
                const response = await fetch(`/apply/${jobId}`, {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    alert('Application submitted successfully!');
                    document.body.removeChild(modal);
                } else {
                    throw new Error('Application submission failed');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    }

    fetchJobs();
});
