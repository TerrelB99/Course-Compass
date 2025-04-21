document.addEventListener("DOMContentLoaded", async function () {
    const container = document.getElementById("notification-list");
    const composeSection = document.getElementById("compose-section");

    const currentUser = JSON.parse(sessionStorage.getItem("admin"));
    if (!currentUser || !currentUser.messageSenderID || !currentUser.messageReceiverID) {
        container.innerHTML = "<p>Error: Please log in again.</p>";
        return;
    }

    const senderID = currentUser.messageSenderID;
    const receiverID = currentUser.messageReceiverID;

    composeSection.innerHTML = `
        <select id="role-select">
          <option value="">Select Role</option>
          <option value="Student">Student</option>
          <option value="Recruiter">Recruiter</option>
          <option value="Counselor">Counselor</option>
          <option value="Admin">Admin</option>
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
            body: JSON.stringify({ senderId: senderID, receiverId: receiverID, message })
        });

        if (res.ok) {
            alert("Message sent.");
            document.getElementById("new-message").value = "";
        } else {
            alert("Error sending message");
        }
    });

    try {
        const threadsRes = await fetch(`/messages/${receiverID}`);
        const messages = await threadsRes.json();
        const unique = [...new Set(messages.map(m => m.senderId))];

        for (const sid of unique) {
            const uRes = await fetch(`/users/lookup/${sid}`);
            const uData = await uRes.json();
            const threadEl = document.createElement("div");
            threadEl.innerHTML = `<h3>${uData.name} (${uData.role})</h3>`;
            threadEl.classList.add("message-thread");
            threadEl.style.cursor = "pointer";
            threadEl.addEventListener("click", () => loadThread(sid, uData.messageReceiverID));
            container.appendChild(threadEl);
        }
    } catch (err) {
        container.innerHTML = "<p>Error loading threads.</p>";
    }

    async function loadThread(otherSenderId, otherReceiverId) {
        const res = await fetch(`/messages/thread/${senderID}/${receiverID}/${otherSenderId}/${otherReceiverId}`);
        const msgs = await res.json();

        container.innerHTML = "";
        const header = document.createElement("h2");
        header.textContent = "Conversation";
        container.appendChild(header);

        for (const msg of msgs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))) {
            const entry = document.createElement("div");
            entry.classList.add("message-entry", msg.senderId === senderID ? "you" : "them");
            entry.innerHTML = `<p>${msg.message}</p><small>${new Date(msg.timestamp).toLocaleString()}</small>`;
            container.appendChild(entry);
        }

        const replyBoxContainer = document.createElement("div");
        replyBoxContainer.innerHTML = `
            <div class="reply-container">
                <textarea class="reply-text" placeholder="Reply..."></textarea>
                <button class="reply-btn">Reply</button>
            </div>
        `;
        container.appendChild(replyBoxContainer);

        document.querySelector(".reply-btn").onclick = async () => {
            const body = document.querySelector(".reply-text").value.trim();
            if (!body) return alert("Empty reply");

            const res = await fetch('/messages/universal-send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: senderID,
                    receiverId: otherReceiverId,
                    message: body
                })
            });

            if (res.ok) {
                loadThread(otherSenderId, otherReceiverId);
            } else {
                alert("Failed to send reply");
            }
        };
    }
});
