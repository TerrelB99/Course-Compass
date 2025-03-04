document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get("jobId");
    const applicantsContainer = document.getElementById("applicantsContainer");

    if (!jobId) {
        applicantsContainer.innerHTML = "<p>Job ID is missing!</p>";
        return;
    }

    async function fetchApplicants() {
        try {
            const response = await fetch(`/jobs/${jobId}/applicants`);
            const applicants = await response.json();

            applicantsContainer.innerHTML = "";
            if (applicants.length === 0) {
                applicantsContainer.innerHTML = "<p>No applicants yet.</p>";
                return;
            }

            applicants.forEach(applicant => {
                const applicantCard = document.createElement("div");
                applicantCard.className = "applicant-card";
                applicantCard.innerHTML = `
                    <p><strong>Name:</strong> ${applicant.firstName} ${applicant.lastName}</p>
                    <p><strong>Email:</strong> ${applicant.email}</p>
                    <p><strong>Phone:</strong> ${applicant.phone}</p>
                    <p><strong>Address:</strong> ${applicant.address}</p>
                    <p><strong>Skills:</strong> ${applicant.skills.join(", ")}</p>
                `;
                applicantsContainer.appendChild(applicantCard);
            });

        } catch (error) {
            console.error("Error fetching applicants:", error);
            applicantsContainer.innerHTML = "<p>Error loading applicants.</p>";
        }
    }

    fetchApplicants();
});
