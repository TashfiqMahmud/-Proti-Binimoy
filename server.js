// Required environment variables:
// MONGO_URI
// JWT_SECRET
// PORT
// FRONTEND_URL

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const passport = require('passport');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(mongoSanitize({
    replaceWith: '_'
}));

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(passport.initialize());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/offers', require('./routes/offers'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/users', require('./routes/users'));

app.get('/', (req, res) => {
    res.send('Proti-Binimoy API is active.');
});

const PORT = Number(process.env.PORT) || 5000;
const mongoURI = process.env.MONGO_URI;
const jwtSecret = process.env.JWT_SECRET;

const mongoOptions = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4
};

async function startServer() {
    if (!mongoURI) {
        console.error('ERROR: MONGO_URI is missing from your .env file.');
        process.exit(1);
    }

    if (!jwtSecret) {
        console.error('ERROR: JWT_SECRET is missing from your .env file.');
        process.exit(1);
    }

    try {
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(mongoURI, mongoOptions);
        console.log('DATABASE CONNECTED SUCCESSFULLY.');

        app.listen(PORT, () => {
            console.log(`Server listening at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('DATABASE CONNECTION FAILED.');
        console.error('Error Name:', err.name);
        console.error('Reason:', err.message);

        if (
            typeof err.message === 'string' &&
            (err.message.includes('auth failed') || err.message.includes('bad auth'))
        ) {
            console.error('TIP: Your MongoDB username or password in .env may be incorrect.');
        }

        process.exit(1);
    }
}

startServer();