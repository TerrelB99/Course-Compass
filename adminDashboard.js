document.addEventListener("DOMContentLoaded", async () => {
    const userTableBody = document.getElementById("userTableBody");
    const searchInput = document.getElementById("searchInput");
    const userModal = document.getElementById("userModal");
    const userDetails = document.getElementById("userDetails");
    const closeModal = document.querySelector(".close");

    async function fetchUsers() {
        try {
            const response = await fetch("http://localhost:3000/admin/users");
            const users = await response.json();
            displayUsers(users);
        } catch (error) {
            console.error("❌ Error fetching users:", error);
        }
    }

    function displayUsers(users) {
        userTableBody.innerHTML = ""; // Clear previous data

        users.forEach(user => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.username}</td>
                <td>${user.role}</td>
                <td>
                    <button class="action-btn toggle-btn" data-id="${user._id}" data-role="${user.role}">
                    ${user.isActive ? "Deactivate" : "Activate"}</button>
                    <button class="action-btn view-btn" data-id="${user._id}" data-role="${user.role}">View</button>
                    <button class="action-btn delete-btn" data-id="${user._id}" data-role="${user.role}">Delete</button>
                </td>
            `;
            userTableBody.appendChild(row);
        });

        // Add event listeners for delete buttons
        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", async (event) => {
                const userId = event.target.getAttribute("data-id");
                const role = event.target.getAttribute("data-role");

                if (confirm("Are you sure you want to delete this user?")) {
                    await deleteUser(userId, role);
                }
            });
        });

        // Add event listeners for view buttons
        document.querySelectorAll(".view-btn").forEach(button => {
            button.addEventListener("click", async (event) => {
                const userId = event.target.getAttribute("data-id");
                const role = event.target.getAttribute("data-role");
                await viewUserDetails(userId, role);
            });
        });

        document.querySelectorAll(".toggle-btn").forEach(button => {
            button.addEventListener("click", async (event) => {
                const userId = event.target.getAttribute("data-id");
                const role = event.target.getAttribute("data-role");

                try {
                    const res = await fetch(`http://localhost:3000/admin/toggle-status/${role.toLowerCase()}/${userId}`, {
                        method: "PATCH"
                    });
                    const result = await res.json();
                    alert(result.message);
                    fetchUsers();
                } catch (err) {
                    console.error("Toggle error:", err);
                }
            });
        });

    }

    async function deleteUser(userId, role) {
        try {
            const response = await fetch(`http://localhost:3000/admin/delete/${role.toLowerCase()}/${userId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                alert("User deleted successfully!");
                fetchUsers(); // Refresh the table
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error("❌ Error deleting user:", error);
        }
    }

    async function viewUserDetails(userId, role) {
        try {
            const response = await fetch(`http://localhost:3000/admin/user/${role.toLowerCase()}/${userId}`);
            const user = await response.json();

            if (user) {
                // Attach the role to the user object (since it’s not in the DB)
                user.role = role;

                const first = user.firstname || user.firstName || "";
                const last = user.lastname || user.lastName || "";
                const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A";

// Determine role-specific fields
                let extraInfo = "";
                if (role === "Recruiter") {
                    extraInfo = `<strong>Company:</strong> ${user.company || "N/A"}<br>`;
                } else if (role === "Student") {
                    extraInfo = `<strong>University:</strong> ${user.university || "N/A"}<br>`;
                } else if (role === "Counselor") {
                    extraInfo = `
        <strong>University:</strong> ${user.university || "N/A"}<br>
        <strong>Major:</strong> ${user.major || "N/A"}<br>
    `;
                }

                userDetails.innerHTML = `
    <strong>Name:</strong> ${first} ${last}<br>
    <strong>Username:</strong> ${user.username}<br>
    <strong>Role:</strong> ${user.role}<br>
    <strong>Email:</strong> ${user.email || "N/A"}<br>
    ${extraInfo}
    <strong>Created At:</strong> ${createdAt}
`;

                userModal.style.display = "block";

            } else {
                alert("User details not found.");
            }
        } catch (error) {
            console.error("❌ Error fetching user details:", error);
        }
    }


    closeModal.addEventListener("click", () => {
        userModal.style.display = "none";
    });

    window.onclick = (event) => {
        if (event.target === userModal) {
            userModal.style.display = "none";
        }
    };

    await fetchUsers(); // Fetch users on page load
});
