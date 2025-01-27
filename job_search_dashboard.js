document.addEventListener("DOMContentLoaded", async () => {
    const jobCardsContainer = document.getElementById("jobCards");

    async function fetchJobs() {
        try {
            const response = await fetch('/jobs');
            return await response.json();
        } catch (error) {
            console.error('Error fetching jobs:', error);
            return [];
        }
    }

    async function renderJobs() {
        const jobs = await fetchJobs();

        jobCardsContainer.innerHTML = '';
        jobs.forEach((job) => {
            const card = document.createElement("div");
            card.classList.add("card");
            card.innerHTML = `
                <div class="card-header">${job.jobTitle}</div>
                <div class="card-content">
                  <p><strong>Company:</strong> ${job.company}</p>
                  <p><strong>Location:</strong> ${job.location}</p>
                  <p><strong>Description:</strong> ${job.description}</p>
                  ${job.applicationLink ? `<p><a href="${job.applicationLink}" target="_blank">External Application Link</a></p>` : ''}
                </div>
                <div class="card-footer">
                  <button class="apply-btn" data-job-id="${job._id}">Apply Now</button>
                </div>
            `;
            jobCardsContainer.appendChild(card);
        });

        document.querySelectorAll('.apply-btn').forEach((button) => {
            button.addEventListener('click', (e) => {
                const jobId = e.target.dataset.jobId;
                openApplicationForm(jobId);
            });
        });
    }

    function openApplicationForm(jobId) {
        const formHtml = `
            <div class="application-form">
                <h2>Apply for Job</h2>
                <form id="applicationForm">
                    <input type="text" id="firstName" placeholder="First Name" required>
                    <input type="text" id="lastName" placeholder="Last Name" required>
                    <input type="email" id="email" placeholder="Email" required>
                    <button type="submit">Submit</button>
                </form>
            </div>
        `;

        const modal = document.createElement("div");
        modal.innerHTML = formHtml;
        document.body.appendChild(modal);

        const form = document.getElementById("applicationForm");
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const applicationData = {
                firstName: document.getElementById("firstName").value,
                lastName: document.getElementById("lastName").value,
                email: document.getElementById("email").value,
            };

            try {
                const response = await fetch(`/apply/${jobId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(applicationData),
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

    renderJobs();
});
