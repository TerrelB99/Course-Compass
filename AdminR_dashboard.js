document.addEventListener("DOMContentLoaded", async () => {
    const jobList = document.getElementById("job-list");
    const modalOverlay = document.getElementById("modal-overlay");
    const applicantsModal = document.getElementById("applicants-modal");
    const applicantList = document.getElementById("applicant-list");
    const closeModal = document.getElementById("close-modal");

    async function fetchJobs() {
        try {
            const response = await fetch("http://localhost:3000/jobs");
            const jobs = await response.json();
            jobList.innerHTML = "";

            jobs.forEach(job => {
                const jobCard = document.createElement("div");
                jobCard.classList.add("job-card");
                jobCard.innerHTML = `
                    <div class="job-header">${job.title} - ${job.company}</div>
                    <p>${job.description}</p>
                    <p><strong>Location:</strong> ${job.location}</p>
                    <p><strong>Salary:</strong> $${job.salary}</p>
                    <p><strong>Skills:</strong> ${job.skills.join(", ")}</p>
                    <div class="job-actions">
                        <button class="view-applicants" data-id="${job._id}">View Applicants</button>
                        <button class="delete-job" data-id="${job._id}">Delete Job</button>
                    </div>
                `;
                jobList.appendChild(jobCard);
            });

            document.querySelectorAll(".view-applicants").forEach(button => {
                button.addEventListener("click", async (e) => {
                    const jobId = e.target.getAttribute("data-id");
                    await fetchApplicants(jobId);
                });
            });

            document.querySelectorAll(".delete-job").forEach(button => {
                button.addEventListener("click", async (e) => {
                    const jobId = e.target.getAttribute("data-id");
                    await deleteJob(jobId);
                });
            });

        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    }

    async function fetchApplicants(jobId) {
        try {
            const response = await fetch(`http://localhost:3000/jobs/${jobId}/applicants`);
            const applicants = await response.json();

            applicantList.innerHTML = "";
            applicants.forEach(applicant => {
                const li = document.createElement("li");
                li.textContent = `${applicant.name} - ${applicant.email}`;
                applicantList.appendChild(li);
            });

            modalOverlay.style.display = "block";
            applicantsModal.style.display = "block";
        } catch (error) {
            console.error("Error fetching applicants:", error);
        }
    }

    async function deleteJob(jobId) {
        if (!confirm("Are you sure you want to delete this job?")) return;

        try {
            const response = await fetch(`http://localhost:3000/jobs/${jobId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                alert("Job deleted successfully!");
                fetchJobs();
            } else {
                alert("Failed to delete job.");
            }
        } catch (error) {
            console.error("Error deleting job:", error);
        }
    }

    closeModal.addEventListener("click", () => {
        modalOverlay.style.display = "none";
        applicantsModal.style.display = "none";
    });

    fetchJobs();
});
