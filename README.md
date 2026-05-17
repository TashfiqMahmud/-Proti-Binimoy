# Proti-Binimoy

Proti-Binimoy is a Bangladeshi marketplace platform built with the MERN stack. It enables buyers and sellers to post listings, negotiate offers, message each other, manage orders, and complete payments.

## What this project includes

- Backend API with Express and MongoDB
- JWT-based authentication and optional Google OAuth
- Buyer and seller marketplace workflows
- Offer management, chat messaging, saved listings, and profile updates
- Payment integration with SSLCommerz
- Frontend built with React, Vite, and Tailwind-style UI

## Key improvements in this version

- Shared frontend API helper in `web_frontend/src/config/api.js`
- Standardized auth header usage to `Authorization: Bearer <token>`
- Added `/api/auth/me` for current-user profile hydration
- Larger backend JSON payload limit for file previews and base64 image upload data
- Request sanitization with `express-mongo-sanitize`

## Repository layout

```text
.
├── server.js                    # Express server entrypoint
├── package.json                 # Backend dependencies and scripts
├── .env.example                 # Backend environment template
├── models/                      # MongoDB models
│   ├── Listing.js
│   ├── Message.js
│   ├── Offer.js
│   ├── Payment.js
│   └── User.js
├── routes/                      # API route handlers
│   ├── auth.js
│   ├── listings.js
│   ├── offers.js
│   ├── messages.js
│   ├── payments.js
│   └── users.js
├── middleware/                  # Shared middleware
│   └── auth.js
├── scripts/
│   └── seed.js                  # Demo data seeder
├── tests/
│   └── run-tests.js             # Backend test script
└── web_frontend/                # React client application
    ├── package.json
    ├── .env.example
    ├── vite.config.js
    └── src/
        ├── config/api.js
        ├── context/AuthContext.jsx
        ├── App.jsx
        └── components/
```

## Backend setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example`.

3. Seed demo data locally (optional):

```bash
npm run seed
```

4. Start the backend in development mode:

```bash
npm run dev
```

The backend defaults to `http://localhost:5000`.

## Frontend setup

1. Change to the frontend folder:

```bash
cd web_frontend
```

2. Install frontend dependencies:

```bash
npm install
```

3. Start the Vite development server:

```bash
npm run dev
```

The frontend defaults to `http://localhost:5173`.

## Environment variables

Create `backend/.env` from `.env.example` with values for:

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

> The frontend uses `web_frontend/src/config/api.js` to determine `API_BASE_URL`, so ensure the backend is reachable from the client URL.

## Authentication flow

- Normal login/signup uses JWT returned from `/api/auth/login` and stored in browser local storage.
- Google OAuth redirects back to `/auth-success` and loads the authenticated user profile from `/api/auth/me`.
- All authenticated frontend requests now use:

```http
Authorization: Bearer <token>
```

## Running tests

```bash
npm test
```

## Core API endpoints

### Health

- `GET /`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/email/check`
- `POST /api/auth/phone/check`
- `POST /api/auth/phone/verify`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/refresh-token`
- `GET /api/auth/me`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`

### Listings

- `GET /api/listings`
- `GET /api/listings/mine`
- `GET /api/listings/saved`
- `GET /api/listings/:id`
- `POST /api/listings`
- `POST /api/listings/:id/save`
- `PUT /api/listings/:id`
- `DELETE /api/listings/:id`

### Offers

- `GET /api/offers/received`
- `GET /api/offers/sent`
- `GET /api/offers/:id`
- `POST /api/offers`
- `PUT /api/offers/:id/status`

### Messages

- `GET /api/messages/unread-count`
- `GET /api/messages/:offerId`
- `POST /api/messages`

### Users

- `GET /api/users/:id`
- `PUT /api/users/profile`

### Payments

- `POST /api/payments/init`
- `GET /api/payments/my`
- `POST /api/payments/success`
- `POST /api/payments/fail`
- `POST /api/payments/cancel`
- `POST /api/payments/ipn`

## Notes

- Use MongoDB Atlas or local MongoDB with a valid connection string in `MONGO_URI`.
- For Google OAuth, set callback URL in Google Cloud and match `GOOGLE_CALLBACK_URL`.
- For SSLCommerz, use sandbox credentials for development and route notifications to the backend.

## Demo user credentials

```text
Buyer:
  buyer@example.com
  Password123!

Seller:
  seller@example.com
  Password123!
```
