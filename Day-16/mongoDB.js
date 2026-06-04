require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000
})
.then(() => {
    console.log('✅ MongoDB Connected');
})
.catch((err) => {
    console.error('❌ MongoDB Error');
    console.error(err);
});

// Routes
app.get('/', (req, res) => {
    res.send('Server Running');
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});