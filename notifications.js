document.addEventListener("DOMContentLoaded", async function () {
    const notificationsContainer = document.getElementById("notification-list");
    const composeSection = document.getElementById("compose-section");

    const currentUser = JSON.parse(sessionStorage.getItem("student"));
    if (!notificationsContainer || !currentUser?.messageSenderID || !currentUser?.messageReceiverID) {
        notificationsContainer.innerHTML = "<p>Error: Please log in again.</p>";
        return;
    }

    const studentSenderID = currentUser.messageSenderID;
    const studentReceiverID = currentUser.messageReceiverID;

    composeSection.innerHTML = `
        <select id="role-select">
            <option value="">Select Role</option>
            <option value="Recruiter">Recruiter</option>
            <option value="Counselor">Counselor</option>
            <option value="Admin">Admin</option>
            <option value="Student">Student</option>
        </select>
        <select id="user-select"><option value="">Select User</option></select>
        <textarea id="new-message" placeholder="Write a message..."></textarea>
        <button id="send-btn">Send</button>
    `;

    document.getElementById("role-select").addEventListener("change", async function () {
        const role = this.value;
        const userSelect = document.getElementById("user-select");
        userSelect.innerHTML = "<option>Loading...</option>";

        const res = await fetch(`/admin/users`);
        const data = await res.json();
        const filtered = data.filter(u => u.role === role);
        userSelect.innerHTML = `<option value="">Select ${role}</option>` +
            filtered.map(u => `<option value="${u.messageReceiverID}" data-sender="${u.messageSenderID}">
                ${u.firstName} ${u.lastName}</option>`).join("");
    });

    document.getElementById("send-btn").addEventListener("click", async function () {
        const receiverID = document.getElementById("user-select").value;
        const message = document.getElementById("new-message").value.trim();
        if (!receiverID || !message) return alert("Missing fields");

        const res = await fetch('/messages/universal-send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senderId: studentSenderID, receiverId: receiverID, message })
        });

        if (res.ok) {
            alert("Message sent.");
            document.getElementById("new-message").value = "";
        } else {
            alert("Error sending message");
        }
    });

    async function fetchUserDetails(senderUUID) {
        try {
            const res = await fetch(`/users/lookup/${senderUUID}`);
            if (!res.ok) throw new Error("User lookup failed");
            return await res.json();
        } catch (err) {
            console.error("Sender lookup failed:", err);
            return null;
        }
    }

    try {
        const res = await fetch(`/messages/${studentReceiverID}`);
        const inboundMessages = await res.json();
        notificationsContainer.innerHTML = "";

        if (!Array.isArray(inboundMessages) || inboundMessages.length === 0) {
            notificationsContainer.innerHTML = "<p>No messages yet.</p>";
            return;
        }

        // ✅ Group messages by senderId
        const groupedBySender = {};
        for (const msg of inboundMessages) {
            if (!groupedBySender[msg.senderId]) {
                groupedBySender[msg.senderId] = [];
            }
            groupedBySender[msg.senderId].push(msg);
        }

        const sortedSenderIds = Object.keys(groupedBySender).sort((a, b) => {
            const aTime = new Date(groupedBySender[a][0].timestamp);
            const bTime = new Date(groupedBySender[b][0].timestamp);
            return aTime - bTime;
        });

        for (const senderId of sortedSenderIds) {
            const threadMessages = groupedBySender[senderId];
            const senderData = await fetchUserDetails(senderId);
            const senderName = senderData?.name || "User";
            const senderRole = senderData?.role || "User";
            const senderReceiverId = senderData?.messageReceiverID;

            const threadContainer = document.createElement("div");
            threadContainer.classList.add("message-thread");

            const header = document.createElement("h3");
            header.textContent = `${senderName} (${senderRole})`;
            threadContainer.appendChild(header);

            threadMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            for (const msg of threadMessages) {
                const isCurrentUser = (msg.senderId === studentSenderID || msg.senderId === studentReceiverID);
                const senderDisplay = isCurrentUser ? `${currentUser.firstName} ${currentUser.lastName}` : senderName;
                const senderDisplayRole = isCurrentUser ? currentUser.role : senderRole;

                const messageEntry = document.createElement("div");
                messageEntry.classList.add("message-entry", isCurrentUser ? "you" : "them");
                messageEntry.innerHTML = `
                    <p><strong>From:</strong> ${senderDisplay} (${senderDisplayRole})</p>
                    <p>${msg.message}</p>
                    <p><small>${new Date(msg.timestamp).toLocaleString()}</small></p>
                `;
                threadContainer.appendChild(messageEntry);
            }

            const replyArea = document.createElement("div");
            replyArea.classList.add("reply-container");
            replyArea.innerHTML = `
                <textarea class="reply-text" placeholder="Reply..."></textarea>
                <button class="reply-btn">Reply</button>
            `;
            threadContainer.appendChild(replyArea);

            const replyBtn = replyArea.querySelector(".reply-btn");
            const replyText = replyArea.querySelector(".reply-text");

            replyBtn.addEventListener("click", async function () {
                const messageContent = replyText.value.trim();
                if (!messageContent) return alert("Reply cannot be empty.");
                if (!senderReceiverId || !studentSenderID) return alert("Missing identifiers for sending message.");

                try {
                    const sendRes = await fetch("/messages/universal-send", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            senderId: studentSenderID,
                            receiverId: senderReceiverId,
                            message: messageContent
                        })
                    });

                    if (sendRes.ok) {
                        replyText.value = "";
                        const now = new Date();
                        const newMessageEntry = document.createElement("div");
                        newMessageEntry.classList.add("message-entry", "you");
                        newMessageEntry.innerHTML = `
                            <p><strong>From:</strong> ${currentUser.firstName} ${currentUser.lastName} (Student)</p>
                            <p>${messageContent}</p>
                            <p><small>${now.toLocaleString()}</small></p>
                        `;
                        threadContainer.insertBefore(newMessageEntry, replyArea);
                    } else {
                        const errorData = await sendRes.json();
                        alert("Failed to send message: " + (errorData.error || sendRes.statusText));
                    }
                } catch (error) {
                    console.error("Error sending reply:", error);
                    alert("An error occurred while sending the message.");
                }
            });

            notificationsContainer.appendChild(threadContainer);
        }
    } catch (err) {
        console.error("Message fetch error:", err);
        notificationsContainer.innerHTML = "<p>Error loading messages.</p>";
    }
});
