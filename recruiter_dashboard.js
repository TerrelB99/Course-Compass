document.addEventListener("DOMContentLoaded", async function () {
    const jobList = document.getElementById("job-list");
    const postJobModal = document.getElementById("postJobModal");
    const closePostJob = document.getElementById("closePostJob");
    const postJobForm = document.getElementById("postJobForm");
    const addJobBtn = document.getElementById("add-job");

    async function fetchJobs() {
        const response = await fetch("/jobs/recruiter/3963f6");
        const jobs = await response.json();
        jobList.innerHTML = "";
        jobs.forEach(job => {
            const jobCard = document.createElement("div");
            jobCard.className = "card";
            jobCard.innerHTML = `
                <div class="card-header">${job.jobTitle}</div>
                <div class="card-content">
                    <p><strong>Company:</strong> ${job.company}</p>
                    <p><strong>Location:</strong> ${job.location}</p>
                    <p><strong>Salary:</strong> $${job.salary}</p>
                    <p><strong>Description:</strong> ${job.description}</p>
                </div>
                <div class="card-footer">
                    <button class="blue-btn send-message" data-job="${job.jobId}">Send Message</button>
                    <button class="blue-btn view-applicants" data-job="${job.jobId}">View Applicants</button>
                </div>
            `;
            jobList.appendChild(jobCard);
        });

        document.querySelectorAll(".send-message").forEach(button => {
            button.addEventListener("click", (event) => {
                const jobId = event.target.getAttribute("data-job");
                sendMessage(jobId);
            });
        });

        document.querySelectorAll(".view-applicants").forEach(button => {
            button.addEventListener("click", (event) => {
                const jobId = event.target.getAttribute("data-job");
                viewApplicants(jobId);
            });
        });
    }

    function sendMessage(jobId) {
        alert(`Sending message to applicants of job: ${jobId}`);
    }

    function viewApplicants(jobId) {
        alert(`Viewing applicants for job: ${jobId}`);
    }

    addJobBtn.addEventListener("click", () => postJobModal.style.display = "block");
    closePostJob.addEventListener("click", () => postJobModal.style.display = "none");

    postJobForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const jobData = {
            jobTitle: document.getElementById("jobTitle").value,
            company: document.getElementById("company").value,
            location: document.getElementById("location").value,
            salary: document.getElementById("salary").value,
            description: document.getElementById("description").value,
            skillsRequired: document.getElementById("skillsRequired").value.split(","),
            recruiterID: "3963f6"
        };
        await fetch("/jobs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(jobData)
        });
        postJobModal.style.display = "none";
        fetchJobs();
    });

    fetchJobs();
});
