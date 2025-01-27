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
const internshipTitleInput = document.getElementById('internshipTitle');
const applicationDateInput = document.getElementById('applicationDate');
const expectedToHearBackInput = document.getElementById('expectedToHearBack');
const addInternshipButton = document.getElementById('addInternshipButton');
const internshipTable = document.getElementById('internshipTable').querySelector('tbody');

// Add internship to the tracker
addInternshipButton.addEventListener('click', () => {
    const companyName = companyNameInput.value.trim();
    const internshipTitle = internshipTitleInput.value.trim();
    const applicationDate = applicationDateInput.value;
    const expectedToHearBack = expectedToHearBackInput.value;

    if (companyName && internshipTitle && applicationDate && expectedToHearBack) {
        // Create a new row
        const row = document.createElement('tr');

        // Add columns to the row
        const companyCell = document.createElement('td');
        companyCell.textContent = companyName;

        const titleCell = document.createElement('td');
        titleCell.textContent = internshipTitle;

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
        yesButton.addEventListener('click', () => {
            statusCell.textContent = 'Offered';
            statusCell.style.color = '#28a745';
            statusCell.style.fontWeight = 'bold';
        });

        const noButton = document.createElement('button');
        noButton.className = 'status-button no';
        noButton.textContent = 'No';
        noButton.addEventListener('click', () => {
            statusCell.textContent = 'No Offer';
            statusCell.style.color = '#dc3545';
            statusCell.style.fontWeight = 'bold';
        });

        statusButtons.appendChild(yesButton);
        statusButtons.appendChild(noButton);
        statusCell.appendChild(statusButtons);

        // Append cells to the row
        row.appendChild(companyCell);
        row.appendChild(titleCell);
        row.appendChild(dateCell);
        row.appendChild(expectedCell);
        row.appendChild(statusCell);

        // Add the row to the table
        internshipTable.appendChild(row);

        // Clear input fields
        companyNameInput.value = '';
        internshipTitleInput.value = '';
        applicationDateInput.value = '';
        expectedToHearBackInput.value = '';
    }
});
