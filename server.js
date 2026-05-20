const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware to parse incoming JSON data from the frontend
app.use(express.json());

// Serve your frontend files (HTML, CSS, JS) from your current directory
app.use(express.static(__dirname));

// Server-side data state
let expensesList = [];
let totalSpent = 0;

// Fallback route to explicitly serve index.html if static serving misses it
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 1. GET Route: Sends the list and the pre-calculated total to the frontend
app.get('/api/expenses', (req, res) => {
    res.json({
        list: expensesList,
        total: totalSpent
    });
});

// 2. POST Route: Receives a new expense, updates the total, and saves it
app.post('/api/expenses', (req, res) => {
    // Changed 'name' and 'cost' to match your HTML ('item' and 'amount')
    const { item, amount } = req.body;
    
    if (!item || isNaN(amount)) {
        return res.status(400).json({ error: 'Please provide both an item name and a valid amount.' });
    }

    const newExpense = {
        id: Date.now(), // Unique ID
        item: item,
        amount: parseFloat(amount)
    };

    expensesList.push(newExpense);
    
    // Recalculate the total spent on the server side
    totalSpent = expensesList.reduce((sum, current) => sum + current.amount, 0);

    res.status(201).json(newExpense);
});

app.listen(PORT, () => {
    console.log(`Server is cruising on http://localhost:${PORT}`);
});