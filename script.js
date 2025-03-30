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
const jobTypeInput = document.getElementById('jobType');
const companyNameInput = document.getElementById('companyName');
const positionInput = document.getElementById('position'); // Fixed from internshipTitleInput
const applicationDateInput = document.getElementById('applicationDate');
const expectedToHearBackInput = document.getElementById('expectedToHearBack');
const addJobButton = document.getElementById('addJobButton'); // Fixed button ID
const jobTable = document.getElementById('jobTable').querySelector('tbody'); // Fixed table ID

// Add job to the tracker
addJobButton.addEventListener('click', () => {
    const jobType = jobTypeInput.value;
    const companyName = companyNameInput.value.trim();
    const position = positionInput.value.trim();
    const applicationDate = applicationDateInput.value;
    const expectedToHearBack = expectedToHearBackInput.value;

    if (companyName && position && applicationDate && expectedToHearBack) {
        // Create a new row
        const row = document.createElement('tr');

        // Add columns to the row
        const jobTypeCell = document.createElement('td');
        jobTypeCell.textContent = jobType;

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

        // Append cells to the row
        row.appendChild(jobTypeCell);
        row.appendChild(companyCell);
        row.appendChild(positionCell);
        row.appendChild(dateCell);
        row.appendChild(expectedCell);
        row.appendChild(statusCell);

        // Add the row to the table
        jobTable.appendChild(row);

        // Clear input fields
        companyNameInput.value = '';
        positionInput.value = '';
        applicationDateInput.value = '';
        expectedToHearBackInput.value = '';
    }
});
