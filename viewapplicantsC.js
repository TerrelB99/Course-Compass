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
                    <textarea id="message-${applicant.studentID}" placeholder="Enter message..." class="message-input"></textarea>
                    <button class="send-message-btn" data-student-id="${applicant.studentID}">Send Message</button>
                    <button class="view-messages-btn" data-student-id="${applicant.studentID}">View Messages</button>
                    <div id="messages-${applicant.studentID}" class="messages-container"></div>
                `;
                applicantsContainer.appendChild(applicantCard);
            });
            document.querySelectorAll('.send-message-btn').forEach(button => {
                button.addEventListener('click', async function () {
                    const studentId = this.getAttribute('data-student-id');
                    const messageInput = document.querySelector(`#message-${studentId}`);
                    const message = messageInput.value.trim();

                    const recruiterId = localStorage.getItem("recruiterID");
                    const counselorData = sessionStorage.getItem("counselor");
                    const counselorId = counselorData ? JSON.parse(counselorData)._id : null;
                    const senderId = recruiterId || counselorId;

                    if (!senderId) {
                        alert("Error: Recruiter or Counselor ID is missing. Please log in again.");
                        return;
                    }


                    if (!recruiterId) {
                        alert("Error: Recruiter ID is missing. Please log in again.");
                        return;
                    }

                    if (!message) {
                        alert("Message cannot be empty.");
                        return;
                    }

                    try {
                        const response = await fetch('/messages/send', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ senderId, receiverId: studentId, message })
                        });

                        const data = await response.json();
                        if (response.ok) {
                            alert("Message sent successfully.");
                            messageInput.value = "";
                        } else {
                            alert("Error sending message: " + data.error);
                        }
                    } catch (error) {
                        console.error("Error sending message:", error);
                        alert("Failed to send message.");
                    }
                });
            });


            document.querySelectorAll('.view-messages-btn').forEach(button => {
                button.addEventListener('click', async function () {
                    const studentId = this.getAttribute('data-student-id');
                    const messagesContainer = document.querySelector(`#messages-${studentId}`);

                    try {
                        const response = await fetch(`/messages/${studentId}`);
                        if (!response.ok) {
                            throw new Error("Failed to fetch messages");
                        }

                        const messages = await response.json();
                        messagesContainer.innerHTML = "";
                        if (messages.length === 0) {
                            messagesContainer.innerHTML = "<p>No messages yet.</p>";
                            return;
                        }

                        messages.forEach(msg => {
                            const messageCard = document.createElement("div");
                            messageCard.className = "message-card";
                            messageCard.innerHTML = `
                    <p><strong>From:</strong> ${msg.senderId}</p>
                    <p><strong>Message:</strong> ${msg.message}</p>
                    <p><strong>Received:</strong> ${new Date(msg.timestamp).toLocaleString()}</p>
                `;
                            messagesContainer.appendChild(messageCard);
                        });
                    } catch (error) {
                        console.error("Error fetching messages:", error);
                        messagesContainer.innerHTML = "<p>Error loading messages.</p>";
                    }
                });
            });

        } catch (error) {
            console.error("Error fetching applicants:", error);
            applicantsContainer.innerHTML = "<p>Error loading applicants.</p>";
        }
    }

    function populateCollegeDropdown(applicants) {
        const dropdown = document.getElementById("collegeDropdown");
        const uniqueColleges = [...new Set(applicants.map(app => app.university).filter(Boolean))];

        uniqueColleges.forEach(college => {
            const option = document.createElement("option");
            option.value = college;
            option.textContent = college;
            dropdown.appendChild(option);
        });

        dropdown.addEventListener("change", () => {
            const selected = dropdown.value;
            displayApplicants(selected === "all" ? applicants : applicants.filter(a => a.university === selected));
        });
    }



    fetchApplicants();
    displayApplicants(applicants);
    populateCollegeDropdown(applicants);

});
