// Helper function to format date as words
function formatDateAsWords(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Helper function to format month as words
function formatMonthAsWords(monthString) {
    const [year, month] = monthString.split('-');
    const date = new Date(year, month - 1);
    const options = { year: 'numeric', month: 'long' };
    return date.toLocaleDateString(undefined, options);
}

// Select elements
const companyNameInput = document.getElementById('companyName');
const positionInput = document.getElementById('position');
const applicationDateInput = document.getElementById('applicationDate');
const expectedToHearBackInput = document.getElementById('expectedToHearBack');
const addJobButton = document.getElementById('addJobButton');
const jobTable = document.getElementById('jobTable').querySelector('tbody');

// Add job manually
addJobButton.addEventListener('click', () => {
    const companyName = companyNameInput.value.trim();
    const position = positionInput.value.trim();
    const applicationDate = applicationDateInput.value;
    const expectedToHearBack = expectedToHearBackInput.value;

    if (companyName && position && applicationDate && expectedToHearBack) {
        createJobRow(companyName, position, applicationDate, expectedToHearBack);

        // Clear inputs
        companyNameInput.value = '';
        positionInput.value = '';
        applicationDateInput.value = '';
        expectedToHearBackInput.value = '';
    }
});

// Create a new job row
function createJobRow(companyName, position, applicationDate, expectedToHearBack) {
    const row = document.createElement('tr');

    const companyCell = document.createElement('td');
    companyCell.textContent = companyName;

    const positionCell = document.createElement('td');
    positionCell.textContent = position;

    const dateCell = document.createElement('td');
    dateCell.textContent = formatDateAsWords(applicationDate);

    const expectedCell = document.createElement('td');
    expectedCell.textContent = formatMonthAsWords(expectedToHearBack);

    const statusCell = document.createElement('td');
    const statusButtons = document.createElement('div');
    statusButtons.className = 'status-buttons';

    const yesButton = document.createElement('button');
    yesButton.className = 'status-button yes';
    yesButton.textContent = 'Yes';
    yesButton.style.backgroundColor = '#28a745';
    yesButton.style.color = '#fff';
    yesButton.addEventListener('click', () => {
        statusCell.textContent = 'Offered';
        statusCell.style.color = '#28a745';
        statusCell.style.fontWeight = 'bold';
    });

    const noButton = document.createElement('button');
    noButton.className = 'status-button no';
    noButton.textContent = 'No';
    noButton.style.backgroundColor = '#dc3545';
    noButton.style.color = '#fff';
    noButton.addEventListener('click', () => {
        statusCell.textContent = 'No Offer';
        statusCell.style.color = '#dc3545';
        statusCell.style.fontWeight = 'bold';
    });

    statusButtons.appendChild(yesButton);
    statusButtons.appendChild(noButton);
    statusCell.appendChild(statusButtons);

    row.appendChild(companyCell);
    row.appendChild(positionCell);
    row.appendChild(dateCell);
    row.appendChild(expectedCell);
    row.appendChild(statusCell);

    jobTable.appendChild(row);
}

// Load applied jobs automatically
async function loadAppliedJobs() {
    try {
        const studentID = sessionStorage.getItem("studentID");
        if (!studentID) {
            console.warn("⚠️ No studentID in sessionStorage.");
            return;
        }

        const response = await fetch(`/api/student/appliedJobs?studentID=${studentID}`);
        const { appliedJobs } = await response.json();

        if (Array.isArray(appliedJobs)) {
            for (const job of appliedJobs) {
                let companyName = 'Unknown Company';
                let position = job.jobTitle || 'Unknown Position';
                let dateApplied = new Date();

                // Fetch full job details
                if (job.jobId) {
                    const jobResponse = await fetch(`/api/jobs/${job.jobId}`);
                    if (jobResponse.ok) {
                        const jobData = await jobResponse.json();
                        companyName = jobData.company || 'Unknown Company';
                    }
                }

                const expectedHearBack = new Date(dateApplied);
                expectedHearBack.setMonth(expectedHearBack.getMonth() + 1);

                createJobRow(
                    companyName,
                    position,
                    dateApplied.toISOString().slice(0, 10),
                    expectedHearBack.toISOString().slice(0, 7)
                );
            }
        }
    } catch (error) {
        console.error("❌ Failed to load applied jobs:", error);
    }
}

// Load jobs on page load
window.addEventListener('DOMContentLoaded', loadAppliedJobs);
