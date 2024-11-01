const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 4000;

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://127.0.0.1:5500' }));

// File paths for user and medicine data
const userDataPath = path.join(__dirname, 'data', 'users.json');
const medicineDataPath = path.join(__dirname, 'data', 'medicines.json');

// Initialize data files if they don't exist
const initializeDataFiles = () => {
    if (!fs.existsSync(userDataPath)) {
        fs.writeFileSync(userDataPath, JSON.stringify([])); 
    }
    if (!fs.existsSync(medicineDataPath)) {
        fs.writeFileSync(medicineDataPath, JSON.stringify([])); 
    }
};

// Call the function to ensure data files are initialized
initializeDataFiles();

// Helper function to read data from file
const readDataFromFile = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return data ? JSON.parse(data) : []; // Return an empty array if data is empty
    } catch (error) {
        console.error(`Error reading data from file: ${error.message}`);
        return []; // Return an empty array if JSON parsing fails
    }
};


// Helper function to write data to file
const writeDataToFile = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Register a new user
app.post('/api/register', async (req, res) => {
    const { username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { username, password: hashedPassword, email };

    // Read existing users
    const users = readDataFromFile(userDataPath);

    // Check if username or email already exists
    const existingUser = users.find(user => user.username === username || user.email === email);
    if (existingUser) {
        return res.status(400).json({ error: 'Username or email already exists.' });
    }

    // Add new user and save
    users.push(newUser);
    writeDataToFile(userDataPath, users);
    res.status(201).json({ message: 'User registered successfully!' });
});

// Login user
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const users = readDataFromFile(userDataPath);
    const user = users.find(user => user.username === username);

    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ username: user.username }, 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Invalid credentials.' });
    }
});

// Middleware to protect routes
const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Get the token from the Authorization header
    if (token) {
        jwt.verify(token, 'your_jwt_secret', (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(403);
    }
};

// Add a medicine intake
app.post('/api/medicines', authenticateJWT, async (req, res) => {
    const { name, dosage, times } = req.body;
    const newMedicine = { username: req.user.username, name, dosages: [{ dosage, times }] };

    // Read existing medicines
    const medicines = readDataFromFile(medicineDataPath);
    medicines.push(newMedicine);
    writeDataToFile(medicineDataPath, medicines);
    
    res.status(201).json(newMedicine);
});

// Get medicines for the authenticated user
app.get('/api/medicines', authenticateJWT, async (req, res) => {
    const medicines = readDataFromFile(medicineDataPath);
    const userMedicines = medicines.filter(medicine => medicine.username === req.user.username);
    res.json(userMedicines);
});

// Delete a medicine intake
app.delete('/api/medicines/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;

    // Read existing medicines
    const medicines = readDataFromFile(medicineDataPath);
    const filteredMedicines = medicines.filter(medicine => !(medicine.username === req.user.username && medicine.name === id));

    // Write back to file
    writeDataToFile(medicineDataPath, filteredMedicines);
    res.json({ message: 'Medicine deleted successfully' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
