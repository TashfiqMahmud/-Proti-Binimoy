# Proti-Binimoy

Proti-Binimoy is a MERN marketplace for buying, selling, and bartering items in Bangladesh. Users can create listings, send barter or cash offers, chat around offers, manage incoming and sent trades, and start payments through SSLCommerz.

## Tech Stack

- MongoDB, Mongoose
- Express.js, Node.js
- React, Vite
- JWT authentication
- Google OAuth
- SSLCommerz payment gateway

## Features

- Email/password and Google OAuth authentication
- Marketplace listings with categories, prices, images, and locations
- Buyer sent-offer history and seller incoming-trade management
- Offer status workflow: pending, accepted, declined, cancelled, completed
- Offer-based message threads
- Seller payment/order view
- SSLCommerz payment initialization and callback pages
- Optional database seed script for local demo data

## Project Structure

```text
.
|-- server.js                 # Express startup and MongoDB connection
|-- package.json              # Backend dependencies and scripts
|-- .env.example              # Backend environment variable template
|-- models/                   # Mongoose models
|   |-- User.js
|   |-- Listing.js
|   |-- Offer.js
|   |-- Message.js
|   `-- Payment.js
|-- routes/                   # Express API routes
|   |-- auth.js
|   |-- listings.js
|   |-- offers.js
|   |-- messages.js
|   |-- payments.js
|   `-- users.js
|-- scripts/
|   `-- seed.js               # Local demo data seeder
|-- tests/
|   `-- run-tests.js
`-- web_frontend/             # Vite React client
    |-- package.json
    |-- .env.example
    `-- src/
```

## Backend Setup

```bash
git clone https://github.com/TashfiqMahmud/-Proti-Binimoy.git proti-binimoy
cd proti-binimoy
npm install
cp .env.example .env
npm run seed
npm run dev
```

Before running `npm run seed` or `npm run dev`, set at least `MONGO_URI` and `JWT_SECRET` in `.env`.

## Frontend Setup

```bash
cd web_frontend
npm install
npm run dev
```

The frontend runs on Vite, usually at `http://localhost:5173`. The backend default URL is `http://localhost:5000`.

## Environment Variables

Create a backend `.env` file from `.env.example`:

```env
MONGO_URI=
JWT_SECRET=
PORT=5000
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
SSL_STORE_ID=
SSL_STORE_PASSWORD=
SSL_IS_LIVE=false
```

If the frontend has its own `.env.example`, copy it inside `web_frontend/` and set the API URL expected by `web_frontend/src/config/api.js`.

## Mock Data Setup

After setting backend environment variables, seed the database:

```bash
npm run seed
```

The seed script:

- Connects to MongoDB using `MONGO_URI`
- Refuses to run when `NODE_ENV=production`
- Creates demo users, listings, offers, messages, and payments using existing Mongoose models
- Uses realistic Bangladeshi marketplace data and valid project categories
- Hashes demo passwords with `bcryptjs`
- Avoids duplicate data when run multiple times
- Disconnects from MongoDB after completion

## Demo Login Credentials

```text
Buyer:
buyer@example.com
Password123!

Seller:
seller@example.com
Password123!
```

## Important Notes

- MongoDB Atlas: allow your current IP address in Atlas Network Access, then paste the Atlas connection string into `MONGO_URI`.
- Google OAuth: create OAuth credentials in Google Cloud Console and set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL`.
- SSLCommerz: use sandbox credentials for local development, set `SSL_IS_LIVE=false`, and configure success, fail, cancel, and IPN URLs to point to your backend.
- Do not run the seed script against production data. The script exits when `NODE_ENV=production`.

## Basic API Overview

Health:

- `GET /`

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/email/check`
- `POST /api/auth/phone/check`
- `POST /api/auth/phone/verify`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/refresh-token`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`

Listings:

- `GET /api/listings`
- `GET /api/listings/mine`
- `GET /api/listings/saved`
- `GET /api/listings/:id`
- `POST /api/listings`
- `POST /api/listings/:id/save`
- `PUT /api/listings/:id`
- `DELETE /api/listings/:id`

Offers:

- `GET /api/offers/received`
- `GET /api/offers/sent`
- `GET /api/offers/:id`
- `POST /api/offers`
- `PUT /api/offers/:id/status`

Messages:

- `GET /api/messages/unread-count`
- `GET /api/messages/:offerId`
- `POST /api/messages`

Users:

- `GET /api/users/:id`
- `PUT /api/users/profile`

Payments:

- `POST /api/payments/init`
- `GET /api/payments/my`
- `POST /api/payments/success`
- `POST /api/payments/fail`
- `POST /api/payments/cancel`
- `POST /api/payments/ipn`

Protected endpoints require:

```text
x-auth-token: <jwt>
```

Some routes may also accept:

```text
Authorization: Bearer <jwt>
```
