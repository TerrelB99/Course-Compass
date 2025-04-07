document.addEventListener("DOMContentLoaded", () => {
    const shortlistContainer = document.getElementById("shortlistContainer");
    let shortlist = JSON.parse(localStorage.getItem("shortlist")) || [];

    function renderShortlist() {
        shortlistContainer.innerHTML = "";

        if (shortlist.length === 0) {
            shortlistContainer.innerHTML = "<p>No applicants have been shortlisted.</p>";
            return;
        }

        shortlist.forEach((applicant, index) => {
            const card = document.createElement("div");
            card.classList.add("shortlisted-card");
            card.innerHTML = `
                <p><strong>Name:</strong> ${applicant.name}</p>
                <p><strong>Email:</strong> ${applicant.email}</p>
                <p><strong>Phone:</strong> ${applicant.phone}</p>
                <button class="remove-btn" data-index="${index}">Remove</button>
            `;
            shortlistContainer.appendChild(card);
        });

        document.querySelectorAll(".remove-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                const index = this.getAttribute("data-index");
                shortlist.splice(index, 1);
                localStorage.setItem("shortlist", JSON.stringify(shortlist));
                renderShortlist();
            });
        });
    }

    renderShortlist();
});
