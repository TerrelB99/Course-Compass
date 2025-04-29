document.addEventListener("DOMContentLoaded", () => {
    console.log("Counselor module loaded.");

    let counselor = JSON.parse(sessionStorage.getItem("counselor"));

    if (!counselor || !counselor.messageSenderID || !counselor.messageReceiverID) {
        counselor = {
            firstName: "Franny",
            lastName: "Gresm",
            role: "Counselor",
            messageSenderID: "01b2b61e-f1a8-4ee0-b84a-2d13e06305ca",
            messageReceiverID: "1ee26bf3-236a-4352-9e6a-2979e6c3def1"
        };
        sessionStorage.setItem("counselor", JSON.stringify(counselor));
        console.warn("SessionStorage counselor missing or incomplete. Using fallback.");
    }

    const form = document.getElementById("counselorForm");
    if (form) {
        form.addEventListener("submit", (event) => {
            event.preventDefault();

            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const message = document.getElementById("message").value;

            if (name && email && message) {
                console.log("Counselor request submitted:", { name, email, message });
                alert("Your message has been sent successfully.");
                form.reset();
            } else {
                alert("Please fill out all fields.");
            }
        });
    }
});
