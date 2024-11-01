// medicine.js

// Handle medicine form submission
document.getElementById('medicineForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const dosage = document.getElementById('dosage').value;
    const times = Array.from(document.getElementById('times').selectedOptions).map(option => option.value);
    const medicineMessage = document.getElementById('medicineMessage');
    
    try {
        // Send medicine data to server or store locally for demo
        const response = await fetch('http://localhost:4000/api/add-medicine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
            body: JSON.stringify({ name, dosage, times })
        });
        const data = await response.json();

        if (data.success) {
            medicineMessage.innerText = 'Medicine added successfully!';
            displayMedicine({ name, dosage, times });
        } else {
            medicineMessage.innerText = data.error || 'Failed to add medicine.';
        }
    } catch (error) {
        console.error('Error adding medicine:', error);
        medicineMessage.innerText = 'An error occurred. Please try again later.';
    }
});

// Function to display a medicine in the user's profile
function displayMedicine(medicine) {
    const medicineList = document.getElementById('userMedicines');
    
    const medicineItem = document.createElement('li');
    medicineItem.innerHTML = `
        <strong>Name:</strong> ${medicine.name} <br>
        <strong>Dosage:</strong> ${medicine.dosage} <br>
        <strong>Times:</strong> ${medicine.times.join(', ')}
    `;
    
    medicineList.appendChild(medicineItem);
}

// Function to fetch and display all user medicines on page load
async function loadUserMedicines() {
    try {
        const response = await fetch('http://localhost:4000/api/get-medicines', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        const data = await response.json();

        if (data.medicines) {
            data.medicines.forEach(displayMedicine);
            toggleProfileView();
        } else {
            console.error('Failed to load medicines:', data.error);
        }
    } catch (error) {
        console.error('Error fetching medicines:', error);
    }
}

// Toggle the profile view to show medicine list
function toggleProfileView() {
    document.getElementById('medicineContainer').style.display = 'none';
    document.getElementById('userProfileContainer').style.display = 'block';
}

// Load user medicines if logged in
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (token) {
        loadUserMedicines();
    }
});
