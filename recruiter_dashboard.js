document.addEventListener("DOMContentLoaded", async function () {
    const jobList = document.getElementById("job-list");
    const postJobModal = document.getElementById("postJobModal");
    const closePostJob = document.getElementById("closePostJob");
    const postJobForm = document.getElementById("postJobForm");
    const addJobBtn = document.getElementById("add-job");

    const recruiterSession = sessionStorage.getItem("recruiter");
    const recruiter = recruiterSession ? JSON.parse(recruiterSession).user : null;

    if (!recruiter) {
        alert("You need to log in as a recruiter.");
        return;
    }

    async function fetchJobs() {
        try {
            const response = await fetch(`/jobs/recruiter/${recruiter._id}`);
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
                        <p><strong>Status:</strong> ${job.approved ? "✅ Approved" : "⏳ Pending Approval"}</p>
                    </div>
                    <div class="card-footer">
                        <button class="blue-btn view-applicants" data-job-id="${job._id}">View Applicants</button>
                        <button class="red-btn delete-job" data-job-id="${job._id}">Delete Job</button>
                    </div>
                `;
                jobList.appendChild(jobCard);
            });

            document.querySelectorAll(".view-applicants").forEach(button => {
                button.addEventListener("click", (event) => {
                    const jobId = event.target.getAttribute("data-job-id");
                    window.location.href = `viewapplicants.html?jobId=${jobId}`;
                });
            });

            document.querySelectorAll(".delete-job").forEach(button => {
                button.addEventListener("click", async (event) => {
                    const jobId = event.target.getAttribute("data-job-id");
                    if (confirm("Are you sure you want to delete this job?")) {
                        const response = await fetch(`/jobs/${jobId}`, {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" }
                        });

                        const result = await response.json();
                        if (response.ok) {
                            alert(result.message);
                            fetchJobs();
                        } else {
                            alert("Error deleting job: " + result.message);
                        }
                    }
                });
            });

        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    }

    addJobBtn.addEventListener("click", () => {
        postJobModal.style.display = "block";
    });

    closePostJob.addEventListener("click", () => {
        postJobModal.style.display = "none";
    });

    postJobForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const newJob = {
            jobTitle: document.getElementById("jobTitle").value.trim(),
            company: document.getElementById("company").value.trim(),
            location: document.getElementById("location").value.trim(),
            salary: document.getElementById("salary").value.trim(),
            description: document.getElementById("description").value.trim(),
            skillsRequired: document.getElementById("skillsRequired").value.split(',').map(skill => skill.trim()),
            recruiterID: recruiter._id
        };

        const response = await fetch("/jobs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newJob)
        });

        const result = await response.json();
        if (response.ok) {
            alert("Job posted successfully!");
            postJobModal.style.display = "none";
            fetchJobs();
        } else {
            alert("Error: " + result.message);
        }
    });

    fetchJobs();
});
