document.addEventListener("DOMContentLoaded", async function () {
    const notificationsContainer = document.getElementById("notification-list");
    const studentId = localStorage.getItem("studentID");

    if (!notificationsContainer) {
        console.error("Error: notificationsContainer element not found.");
        return;
    }

    if (!studentId) {
        notificationsContainer.innerHTML = "<p>Error: Student ID not found. Please log in again.</p>";
        return;
    }

    async function fetchMessages() {
        try {
            const response = await fetch(`/messages/${studentId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch messages");
            }

            const messages = await response.json();
            notificationsContainer.innerHTML = "";
            if (messages.length === 0) {
                notificationsContainer.innerHTML = "<p>No new messages.</p>";
                return;
            }

            messages.forEach(msg => {
                const messageItem = document.createElement("li");
                messageItem.className = "notification-item";
                messageItem.innerHTML = `
                    <p><strong>From:</strong> ${msg.senderId}</p>
                    <p><strong>Message:</strong> ${msg.message}</p>
                    <p><strong>Received:</strong> ${new Date(msg.timestamp).toLocaleString()}</p>
                `;
                notificationsContainer.appendChild(messageItem);
            });
        } catch (error) {
            console.error("Error fetching messages:", error);
            notificationsContainer.innerHTML = "<p>Error loading messages.</p>";
        }
    }

    fetchMessages();
});
