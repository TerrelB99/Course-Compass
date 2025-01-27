// delete_jobs.js

document.addEventListener("DOMContentLoaded", async () => {
    const cardGrid = document.querySelector(".card-grid");

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
                        <button class="delete-job" data-job-id="${job._id}">Delete Job</button>
                    </div>
                `;
                cardGrid.appendChild(card);
            });

            document.querySelectorAll('.delete-job').forEach((button) => {
                button.addEventListener('click', async (e) => {
                    const jobId = e.target.dataset.jobId;
                    if (confirm('Are you sure you want to delete this job?')) {
                        await deleteJob(jobId);
                    }
                });
            });
        } catch (error) {
            console.error('Error fetching jobs:', error);
        }
    }

    async function deleteJob(jobId) {
        try {
            const response = await fetch(`/jobs/${jobId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('Job deleted successfully!');
                renderJobs();
            } else {
                throw new Error('Failed to delete job');
            }
        } catch (error) {
            console.error('Error deleting job:', error);
        }
    }

    renderJobs();
});
