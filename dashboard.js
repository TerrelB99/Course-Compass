document.addEventListener("DOMContentLoaded", async () => {
    const cardGrid = document.querySelector(".card-grid");
    const addNewJobBtn = document.getElementById("add-new-job-btn");
    const addJobModal = document.getElementById("add-job-modal");
    const addJobForm = document.getElementById("add-job-form");
    const cancelAddJobBtn = document.getElementById("cancel-add-job");

    async function renderJobs() {
        try {
            const response = await fetch('/jobs');
            const jobs = await response.json();

            cardGrid.innerHTML = '';
            jobs.forEach((job) => {
                const card = document.createElement("div");
                card.className = "card";
                card.innerHTML = `
                    <div class="card-header">${job.jobTitle}</div>
                    <div class="card-content">
                        <p><strong>Company:</strong> ${job.company}</p>
                        <p><strong>Location:</strong> ${job.location}</p>
                        <p><strong>Description:</strong> ${job.description}</p>
                        ${job.applicationLink ? `<p><a href="${job.applicationLink}" target="_blank">Application Link</a></p>` : ''}
                        <button class="view-applicants" data-job-id="${job._id}">View Applicants</button>
                    </div>
                `;
                cardGrid.appendChild(card);
            });
        } catch (error) {
            console.error('Error fetching jobs:', error);
        }
    }

    addNewJobBtn.addEventListener("click", () => {
        addJobModal.style.display = "block";
    });

    cancelAddJobBtn.addEventListener("click", () => {
        addJobModal.style.display = "none";
    });

    addJobForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const jobData = {
            jobTitle: document.getElementById("job-title").value,
            description: document.getElementById("job-description").value,
            location: document.getElementById("job-location").value,
            salary: document.getElementById("job-salary").value,
            skillsRequired: document.getElementById("job-skills").value.split(','),
            applicationLink: document.getElementById("job-link").value || null,
            recruiterId: "12345", // Replace with logged-in recruiter ID
        };

        try {
            const response = await fetch('/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jobData),
            });

            if (response.ok) {
                alert('Job added successfully!');
                addJobModal.style.display = "none";
                renderJobs();
            } else {
                throw new Error('Failed to add job');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    renderJobs();
});
