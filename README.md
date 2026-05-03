# Proti-Binimoy

Proti-Binimoy is a MERN-based marketplace for second-hand trade and barter.

## Current Scope

- Backend API with MongoDB connection and JWT-based authentication
- User registration/login, forgot-password, reset-password, and refresh-token endpoints
- Listings API with protected seller-only create/update/delete and private "my listings" retrieval
- React frontend with public marketplace browsing and listing detail pages
- Protected frontend pages for posting/editing listings and a personal dashboard
- Frontend auth context (`token`, `user`, `login`, `logout`) with automatic token refresh scheduling

## Tech Stack

- Backend: Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, Nodemailer
- Frontend: React (Vite), React Router, Tailwind CSS

## Project Structure

- `server.js` - Express app startup and MongoDB connection
- `routes/auth.js` - Auth API routes
- `routes/listings.js` - Listings API routes (public + protected)
- `models/User.js` - User schema
- `models/Listing.js` - Listing schema
- `web_frontend/` - React client app
- `web_frontend/src/pages/` - Marketplace pages (browse/detail/post/edit/dashboard)

## Prerequisites

- Node.js 18+ (recommended)
- npm
- MongoDB Atlas (or a MongoDB instance)

## Environment Variables (Backend)

Create a `.env` file in the project root:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_random_secret
PORT=5000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_app_password
FRONTEND_URL=http://localhost:5173
```

## Environment Variables (Frontend)

Optional: create `web_frontend/.env` if backend is not running on `http://localhost:5000`.

```env
VITE_API_URL=http://localhost:5000
```

## Install Dependencies

Backend:

```powershell
cd <project-root>
npm.cmd install
```

Frontend:

```powershell
cd <project-root>\web_frontend
npm.cmd install
```

If PowerShell blocks `npm`, use `npm.cmd` instead.

## Run the App

Start backend:

```powershell
cd <project-root>
npm.cmd run dev
```

Start frontend:

```powershell
cd <project-root>\web_frontend
npm.cmd run dev
```

Open the Vite URL shown in the terminal (usually `http://localhost:5173`).

## API Endpoints

- `GET /` - API health message
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
- `GET /api/listings` (supports `page`, `limit`, `category`, `condition`, `search`)
- `GET /api/listings/mine` (auth required)
- `GET /api/listings/saved` (auth required)
- `GET /api/listings/:id`
- `POST /api/listings` (auth required)
- `POST /api/listings/:id/save` (auth required)
- `PUT /api/listings/:id` (auth required)
- `DELETE /api/listings/:id` (auth required)
- `GET /api/offers/received` (auth required)
- `GET /api/offers/sent` (auth required)
- `POST /api/offers` (auth required)
- `GET /api/messages/:offerId` (auth required)
- `POST /api/messages` (auth required)
- `GET /api/users/:id`
- `PUT /api/users/profile` (auth required)

Protected endpoints accept either:
- `Authorization: Bearer <token>`
- `x-auth-token: <token>`

## Frontend Routes

Public:

- `/`
- `/about`
- `/signin`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/marketplace`
- `/profile`
- `/post-item`
- `/auth-success`

## Notes

- Forgot/reset password emails require valid SMTP credentials in backend `.env`.
- Google OAuth requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL`.
