// admin_job_moderation.js

// DOM Ready
window.addEventListener("DOMContentLoaded", () => {
    const pendingJobsContainer = document.getElementById("pending-jobs");

    async function fetchPendingJobs() {
        try {
            const response = await fetch("/admin/jobs/all");

            const jobs = await response.json();
            pendingJobsContainer.innerHTML = "";

            if (!Array.isArray(jobs) || jobs.length === 0) {
                pendingJobsContainer.innerHTML = "<p>No pending jobs to review.</p>";
                return;
            }

            jobs.sort((a, b) => (a.approved === b.approved) ? 0 : a.approved ? 1 : -1);

            jobs.forEach(job => {
                const jobCard = document.createElement("div");
                jobCard.classList.add("job-card");
                const isApproved = job.approved === true;
                let statusLabel = "⏳ Pending";
                if (job.approved === true) statusLabel = "✅ Approved";
                if (job.approved === false && job.reviewed === true) statusLabel = "❌ Rejected";

                jobCard.innerHTML = `
                  <h3>${job.jobTitle}</h3>
                  <p><strong>Company:</strong> ${job.company}</p>
                  <p><strong>Location:</strong> ${job.location}</p>
                  <p><strong>Salary:</strong> $${job.salary}</p>
                  <p><strong>Description:</strong> ${job.description}</p>
                  <p><strong>Skills:</strong> ${job.skillsRequired?.join(", ")}</p>
                  <p><strong>Status:</strong> ${statusLabel}</p>
                  <div class="btn-group">
                    <button class="approve-btn" data-id="${job._id}" ${isApproved ? "disabled" : ""}>✅ Approve</button>
                    <button class="reject-btn" data-id="${job._id}">❌ Reject</button>
                  </div>
                `;


                pendingJobsContainer.appendChild(jobCard);
            });

            addModerationListeners();
        } catch (err) {
            console.error("Error fetching pending jobs:", err);
        }
    }

    function addModerationListeners() {
        document.querySelectorAll(".approve-btn").forEach(button => {
            button.addEventListener("click", async () => {
                const jobId = button.getAttribute("data-id");
                await updateJobStatus(jobId, true);
            });
        });

        document.querySelectorAll(".reject-btn").forEach(button => {
            button.addEventListener("click", async () => {
                const jobId = button.getAttribute("data-id");
                await rejectJob(jobId);
            });
        });
    }

    async function updateJobStatus(jobId, approved) {
        try {
            const res = await fetch(`/admin/jobs/${jobId}/approve`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ approved })
            });

            const data = await res.json();
            alert(data.message);
            fetchPendingJobs();
        } catch (err) {
            console.error("Error updating job status:", err);
        }
    }

    async function rejectJob(jobId) {
        try {
            const res = await fetch(`/admin/jobs/${jobId}/approve`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ approved: false, reviewed: true })
            });
            const data = await res.json();
            alert(data.message);
            fetchPendingJobs();
        } catch (err) {
            console.error("Error deleting job:", err);
        }
    }

    fetchPendingJobs();
});
