document.addEventListener("DOMContentLoaded", () => {
    fetchJobs();

    document.getElementById("applicationForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        await submitApplication();
    });

    document.getElementById("closeApplication").addEventListener("click", () => {
        document.getElementById("applicationModal").style.display = "none";
    });
});

async function fetchJobs() {
    try {
        const response = await fetch("/jobs");
        const jobs = await response.json();
        const jobCardsContainer = document.getElementById("jobCards");

        jobCardsContainer.innerHTML = ""; // Clear existing jobs
        jobs.forEach(job => {
            const jobCard = document.createElement("div");
            jobCard.classList.add("card");
            jobCard.innerHTML = `
                <div class="card-header">${job.jobTitle}</div>
                <div class="card-content">
                    <p><strong>Company:</strong> ${job.company}</p>
                    <p><strong>Location:</strong> ${job.location}</p>
                    <p><strong>Salary:</strong> $${job.salary}</p>
                    <p><strong>Description:</strong> ${job.description}</p>
                    <p><strong>Skills Required:</strong> ${job.skillsRequired.join(", ")}</p>
                </div>
                <div class="card-footer">
                    <button onclick="openApplicationModal('${job.jobId}')">Apply Now</button>
                </div>
            `;
            jobCardsContainer.appendChild(jobCard);
        });
    } catch (error) {
        console.error("Error fetching jobs:", error);
    }
}

function openApplicationModal(jobId) {
    document.getElementById("applicationForm").dataset.jobId = jobId;
    document.getElementById("applicationModal").style.display = "block";
}

async function submitApplication() {
    const jobID = document.getElementById("applicationForm").dataset.jobId;
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phoneNumber = document.getElementById("phoneNumber").value.trim();
    const skills = document.getElementById("skills").value.trim();
    const address = document.getElementById("address").value.trim();
    const resumeFile = document.getElementById("resume").files[0];

    if (!firstName || !lastName || !email || !phoneNumber || !skills || !address) {
        alert("All fields except Resume are required!");
        return;
    }

    let resumeBase64 = "";
    if (resumeFile) {
        resumeBase64 = await toBase64(resumeFile);
    }

    const applicationData = {
        studentID: "98393b",  // Change this dynamically based on logged-in student
        firstName,
        lastName,
        email,
        phone: phoneNumber,
        skills,
        address,
        resume: resumeBase64
    };

    try {
        const response = await fetch(`/jobs/${jobID}/apply`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(applicationData)
        });

        const result = await response.json();
        if (response.ok) {
            alert("Application submitted successfully!");
            document.getElementById("applicationModal").style.display = "none";
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error("Error submitting application:", error);
        alert("Failed to submit application.");
    }
}

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}
