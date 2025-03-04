document.addEventListener("DOMContentLoaded", async function () {
    const jobList = document.getElementById("job-list");
    const postJobModal = document.getElementById("postJobModal");
    const closePostJob = document.getElementById("closePostJob");
    const postJobForm = document.getElementById("postJobForm");
    const addJobBtn = document.getElementById("add-job");
    const applicantsModal = document.getElementById("applicantsModal");
    const applicantsList = document.getElementById("applicantsList");
    const closeApplicantsModal = document.getElementById("closeApplicantsModal");

    const recruiter = JSON.parse(sessionStorage.getItem("recruiter"));
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
                    </div>
                    <div class="card-footer">
                        <button class="blue-btn send-message" data-job-id="${job.jobId}">Send Message</button>
                        <button class="blue-btn view-applicants" data-job-id="${job.jobId}">View Applicants</button>
                    </div>
                `;
                jobList.appendChild(jobCard);
            });

            document.querySelectorAll(".send-message").forEach(button => {
                button.addEventListener("click", async function (e) {
                    const jobId = e.target.dataset.jobId;
                    const message = prompt("Enter your message to the applicants:");
                    if (message) {
                        await sendMessage(jobId, message);
                    }
                });
            });

            document.querySelectorAll(".view-applicants").forEach(button => {
                button.addEventListener("click", async function (e) {
                    const jobId = e.target.dataset.jobId;
                    await viewApplicants(jobId);
                });
            });
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    }

    async function sendMessage(jobId, message) {
        try {
            const response = await fetch("/notifications/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recruiterID: recruiter._id, jobId, message })
            });
            const result = await response.json();
            alert(result.message || "Message sent successfully!");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }

    async function viewApplicants(jobId) {
        try {
            const response = await fetch(`/jobs/${jobId}/applicants`);
            const applicants = await response.json();

            applicantsList.innerHTML = "";
            if (!applicants || applicants.length === 0) {
                applicantsList.innerHTML = `<p>No applicants for this job yet.</p>`;
            } else {
                applicants.forEach(applicant => {
                    const applicantInfo = document.createElement("div");
                    applicantInfo.className = "applicant-card";
                    applicantInfo.innerHTML = `
                    <p><strong>Name:</strong> ${applicant.firstName} ${applicant.lastName}</p>
                    <p><strong>Email:</strong> ${applicant.email}</p>
                    <p><strong>Phone:</strong> ${applicant.phone}</p>
                    <p><strong>Skills:</strong> ${applicant.skills ? applicant.skills.join(", ") : "N/A"}</p>
                    <p><strong>Address:</strong> ${applicant.address || "N/A"}</p>
                    <p><strong>Resume:</strong> ${applicant.resume ? `<a href="${applicant.resume}" target="_blank">View Resume</a>` : "Not provided"}</p>
                `;
                    applicantsList.appendChild(applicantInfo);
                });
            }

            applicantsModal.style.display = "block";
        } catch (error) {
            console.error("Error fetching applicants:", error);
        }
    }


    addJobBtn.addEventListener("click", () => postJobModal.style.display = "block");
    closePostJob.addEventListener("click", () => postJobModal.style.display = "none");
    closeApplicantsModal.addEventListener("click", () => applicantsModal.style.display = "none");

    fetchJobs();
});
