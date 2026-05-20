const express = require('express');
const path = require('path');
const fs = require('fs'); // Built-in file system module
const app = express();
const PORT = 3000;

const DATA_FILE = path.join(__dirname, 'expenses.json');

app.use(express.json());
app.use(express.static(__dirname));

// Helper function: Read expenses from the JSON file safely
function readDataFromFile() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            // If file doesn't exist, initialize it with empty values
            fs.writeFileSync(DATA_FILE, JSON.stringify({ list: [], total: 0 }, null, 2));
        }
        const fileData = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(fileData);
    } catch (error) {
        console.error("Error reading data file:", error);
        return { list: [], total: 0 };
    }
}

// Helper function: Save expenses to the JSON file
function writeDataToFile(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error writing to data file:", error);
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 1. GET Route: Fetch data directly from the persistent file
app.get('/api/expenses', (req, res) => {
    const data = readDataFromFile();
    res.json(data);
});

// 2. POST Route: Add expense with Category support and write to file
app.post('/api/expenses', (req, res) => {
    const { item, amount, category } = req.body;
    
    if (!item || isNaN(amount) || !category) {
        return res.status(400).json({ error: 'Please provide an item, valid amount, and category.' });
    }

    const data = readDataFromFile();

    const newExpense = {
        id: Date.now(), // Used to find and delete later
        item,
        amount: parseFloat(amount),
        category
    };

    data.list.push(newExpense);
    
    // Recalculate total
    data.total = data.list.reduce((sum, current) => sum + current.amount, 0);

    writeDataToFile(data);
    res.status(201).json(newExpense);
});

// 3. DELETE Route: Find an item by ID, remove it, and re-save the file
app.delete('/api/expenses/:id', (req, res) => {
    const targetId = parseInt(req.params.id);
    const data = readDataFromFile();

    // Filter out the item we want to delete
    const originalLength = data.list.length;
    data.list = data.list.filter(exp => exp.id !== targetId);

    if (data.list.length === originalLength) {
        return res.status(404).json({ error: 'Expense item not found.' });
    }

    // Recalculate total after dropping the item
    data.total = data.list.reduce((sum, current) => sum + current.amount, 0);

    writeDataToFile(data);
    res.json({ message: 'Deleted successfully', total: data.total });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});