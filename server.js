const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error("❌ ERROR: MONGO_URI is missing from your .env file!");
} else {
    console.log("⏳ Attempting to connect to MongoDB (Resilient Mode)...");
    
    // Using advanced options to bypass local DNS/Network hangs
    const options = {
        serverSelectionTimeoutMS: 10000, 
        socketTimeoutMS: 45000, 
        family: 4 
    };

    mongoose.connect(mongoURI, options)
    .then(() => {
        console.log("-----------------------------------------");
        console.log("✅ DATABASE CONNECTED SUCCESSFULLY!");
        console.log("✅ Proti-Binimoy is now officially Live.");
        console.log("-----------------------------------------");
    })
    .catch(err => {
        console.log("-----------------------------------------");
        console.log("❌ DATABASE CONNECTION FAILED!");
        console.log("Error Name:", err.name);
        console.log("Reason:", err.message);
        
        if (err.message.includes("auth failed") || err.message.includes("bad auth")) {
            console.log("👉 TIP: Your username or password in .env is incorrect.");
            console.log("👉 Action: Reset your password in MongoDB Atlas > Database Access.");
        }
        
        console.log("-----------------------------------------");
    });
}

// Routes
app.use('/api/auth', require('./routes/auth'));

app.get('/', (req, res) => {
    res.send("Proti-Binimoy API is active.");
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server listening at http://localhost:${PORT}`);
});