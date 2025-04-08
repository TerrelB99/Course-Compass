document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    let jobId = urlParams.get("jobId");
    const applicantsContainer = document.getElementById("applicantsContainer");

    if (!jobId || jobId === "undefined") {
        console.error("❌ Error: jobId is missing from URL.");
        applicantsContainer.innerHTML = "<p>Error: Job ID is missing.</p>";
        return;
    }

    console.log("🔍 Fetching applicants for job ID:", jobId);

    async function fetchApplicants() {
        try {
            const response = await fetch(`/jobs/${jobId}/applicants`);
            if (!response.ok) {
                throw new Error(`❌ Server returned ${response.status} - ${response.statusText}`);
            }

            const applicants = await response.json();
            console.log("✅ Applicants fetched:", applicants);

            applicantsContainer.innerHTML = "";

            if (!Array.isArray(applicants) || applicants.length === 0) {
                applicantsContainer.innerHTML = "<p>No applicants for this job yet.</p>";
                return;
            }

            applicants.forEach(applicant => {
                const applicantCard = document.createElement("div");
                applicantCard.classList.add("applicant-card");
                applicantCard.dataset.messageSenderId = applicant.messageSenderID;

                applicantCard.innerHTML = `
                    <p><strong>Name:</strong> ${applicant.firstName} ${applicant.lastName}</p>
                    <p><strong>Email:</strong> ${applicant.email}</p>
                    <p><strong>Phone:</strong> ${applicant.phone}</p>
                    <p><strong>Address:</strong> ${applicant.address}</p>
                    <p><strong>Skills:</strong> ${Array.isArray(applicant.skills) ? applicant.skills.join(", ") : applicant.skills}</p>
                    <textarea id="message-${applicant.studentID}" placeholder="Enter message..." class="message-input"></textarea>
                    <button class="send-message-btn" data-student-id="${applicant.studentID}" data-message-receiver-id="${applicant.messageReceiverID}">Send Message</button>
                    <button class="view-messages-btn" 
                        data-student-id="${applicant.studentID}" 
                        data-message-sender-id="${applicant.messageSenderID}" 
                        data-message-receiver-id="${applicant.messageReceiverID}">
                        View Messages
                    </button>
                    <button class="shortlist-btn" data-student-id="${applicant.studentID}" 
                            data-name="${applicant.firstName} ${applicant.lastName}"
                            data-email="${applicant.email}"
                            data-phone="${applicant.phone}">⭐ Shortlist</button>
                    <div id="messages-${applicant.studentID}" class="messages-container"></div>
                    
                `;
                applicantsContainer.appendChild(applicantCard);
            });

            setupMessageEventListeners();
        } catch (error) {
            console.error("❌ Error fetching applicants:", error);
            applicantsContainer.innerHTML = "<p>Error loading applicants.</p>";
        }
    }

    function setupMessageEventListeners() {
        document.querySelectorAll('.send-message-btn').forEach(button => {
            button.addEventListener('click', async function () {
                const studentId = this.getAttribute('data-student-id');
                const messageReceiverId = this.getAttribute('data-message-receiver-id');
                const messageInput = document.querySelector(`#message-${studentId}`);
                const message = messageInput.value.trim();

                const recruiterSenderID = localStorage.getItem("recruiterSenderID");

                if (!recruiterSenderID) {
                    alert("Error: Recruiter ID is missing. Please log in again.");
                    return;
                }

                if (!message) {
                    alert("Message cannot be empty.");
                    return;
                }

                try {
                    const response = await fetch('/messages/universal-send', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            senderId: recruiterSenderID,
                            receiverId: messageReceiverId,
                            message
                        })
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
                const applicantSenderId = this.getAttribute('data-message-sender-id');
                const applicantReceiverId = this.getAttribute('data-message-receiver-id');
                const messagesContainer = document.querySelector(`#messages-${studentId}`);

                const recruiterSenderId = localStorage.getItem("recruiterSenderID");
                const recruiterReceiverId = localStorage.getItem("recruiterReceiverID");

                if (!recruiterSenderId || !recruiterReceiverId || !applicantSenderId || !applicantReceiverId) {
                    alert("Missing recruiter or applicant identifiers. Please log in again.");
                    return;
                }

                try {
                    const response = await fetch(`/messages/thread/${recruiterSenderId}/${recruiterReceiverId}/${applicantSenderId}/${applicantReceiverId}`);
                    if (!response.ok) throw new Error("Failed to fetch messages");

                    const messages = await response.json();
                    messagesContainer.innerHTML = "";

                    if (messages.length === 0) {
                        messagesContainer.innerHTML = "<p>No messages yet.</p>";
                        return;
                    }

                    messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

                    for (const msg of messages) {
                        try {
                            const lookupRes = await fetch(`/users/lookup/${msg.senderId}`);
                            const userData = await lookupRes.json();
                            const senderName = userData?.name || "Unknown";
                            const senderRole = userData?.role || "User";

                            const isRecruiter = msg.senderId === recruiterSenderId || msg.senderId === recruiterReceiverId;

                            const messageCard = document.createElement("div");
                            messageCard.classList.add(isRecruiter ? "you" : "them", "message-thread");

                            messageCard.innerHTML = `
                                <p><strong>From:</strong> ${senderName} (${senderRole})</p>
                                <p>${msg.message}</p>
                                <p><small>${new Date(msg.timestamp).toLocaleString()}</small></p>
                            `;
                            messagesContainer.appendChild(messageCard);
                        } catch (lookupErr) {
                            console.error("Failed to lookup sender info:", lookupErr);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching messages:", error);
                    messagesContainer.innerHTML = "<p>Error loading messages.</p>";
                }
            });
        });
        document.querySelectorAll('.shortlist-btn').forEach(button => {
            button.addEventListener('click', function () {
                const name = this.getAttribute('data-name');
                const email = this.getAttribute('data-email');
                const phone = this.getAttribute('data-phone');

                const shortlist = JSON.parse(localStorage.getItem("shortlist")) || [];

                // Avoid duplicates
                if (!shortlist.some(entry => entry.email === email)) {
                    shortlist.push({ name, email, phone });
                    localStorage.setItem("shortlist", JSON.stringify(shortlist));
                    alert(`${name} has been added to your shortlist.`);
                } else {
                    alert(`${name} is already in your shortlist.`);
                }
            });
        });
    }

    fetchApplicants();
});