document.addEventListener("DOMContentLoaded", async function () {
    const notificationsContainer = document.getElementById("notification-list");

    const currentUser =
        JSON.parse(sessionStorage.getItem("student")) ||
        JSON.parse(sessionStorage.getItem("recruiter")) ||
        JSON.parse(sessionStorage.getItem("counselor")) ||
        JSON.parse(sessionStorage.getItem("admin"));

    if (!notificationsContainer || !currentUser?.messageReceiverID || !currentUser?.messageSenderID) {
        notificationsContainer.innerHTML = "<p>Error: Please log in again.</p>";
        return;
    }

    const receiverId = currentUser.messageReceiverID;
    const senderId = currentUser.messageSenderID;

    async function fetchSenderDetails(senderUUID) {
        try {
            const res = await fetch(`/users/lookup/${senderUUID}`);
            if (!res.ok) throw new Error("User lookup failed");
            const data = await res.json();
            return {
                label: `${data.name} (${data.role})`,
                replyReceiverID: data.messageReceiverID
            };
        } catch (err) {
            console.error("Sender lookup failed:", err);
            return {
                label: senderUUID,
                replyReceiverID: null
            };
        }
    }

    async function fetchMessages() {
        try {
            const res = await fetch(`/messages/${receiverId}`);
            const messages = await res.json();
            notificationsContainer.innerHTML = "";

            if (!messages.length) {
                notificationsContainer.innerHTML = "<p>No new messages.</p>";
                return;
            }

            for (const msg of messages) {
                const sender = await fetchSenderDetails(msg.senderId);
                const item = document.createElement("li");
                item.className = "notification-item";
                item.innerHTML = `
                    <p><strong>From:</strong> ${sender.label}</p>
                    <p>${msg.message}</p>
                    <p><small>${new Date(msg.timestamp).toLocaleString()}</small></p>
                    <textarea class="reply-text" placeholder="Write a reply..."></textarea>
                    <button class="reply-btn" data-receiver-id="${sender.replyReceiverID}">Reply</button>
                `;
                notificationsContainer.appendChild(item);
            }

            document.querySelectorAll('.reply-btn').forEach(button => {
                button.addEventListener("click", async function () {
                    const replyText = this.previousElementSibling.value.trim();
                    const replyToReceiverId = this.getAttribute("data-receiver-id");

                    if (!replyText) return alert("Reply cannot be empty.");
                    if (!replyToReceiverId) return alert("Could not determine who to reply to.");

                    const res = await fetch("/messages/universal-send", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ senderId, receiverId: replyToReceiverId, message: replyText })
                    });

                    if (res.ok) {
                        alert("Reply sent!");
                        this.previousElementSibling.value = "";
                    } else {
                        alert("Failed to send reply.");
                    }
                });
            });
        } catch (err) {
            console.error("Message fetch error:", err);
            notificationsContainer.innerHTML = "<p>Error loading messages.</p>";
        }
    }

    fetchMessages();
});
