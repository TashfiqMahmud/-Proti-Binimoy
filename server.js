// Required environment variables:
// MONGO_URI
// JWT_SECRET
// PORT
// FRONTEND_URL
// BACKEND_URL
// SSL_STORE_ID
// SSL_STORE_PASSWORD
// SSL_IS_LIVE

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1); // Needed for Railway / proxy headers with express-rate-limit

const defaultDevOrigins = ['http://localhost:5173'];
const envOrigins = (process.env.FRONTEND_URL || 'https://proti-binimoy.vercel.app')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
const frontendOrigins = Array.from(new Set([...envOrigins, ...defaultDevOrigins]));

console.log('CORS allowed origins:', frontendOrigins);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || frontendOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked: ${origin}`));
        }
    },
    credentials: true,
    methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
    allowedHeaders: ['Origin','X-Requested-With','Content-Type','Accept','Authorization'],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

app.use(passport.initialize());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/offers', require('./routes/offers'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/users', require('./routes/users'));
app.use('/api/payments', require('./routes/payments'));

app.get('/', (req, res) => {
    res.send('Proti-Binimoy API is active.');
});

app.use((req, res) => {
    res.status(404).json({ msg: 'Route not found.' });
});

app.use((err, req, res, next) => {
    console.error('UNHANDLED_ERROR:', err);
    res.status(500).json({ msg: 'Server error' });
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