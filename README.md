# Proti-Binimoy

Proti-Binimoy is a MERN-based marketplace for second-hand trade and barter.

## Current Scope

- Backend API with MongoDB connection and JWT-based authentication
- User registration and login endpoints (`/api/auth/register`, `/api/auth/login`)
- React frontend with pages for home, about, sign in, register, and forgot password
- Frontend login/register wired to backend auth API

## Tech Stack

- Backend: Node.js, Express, MongoDB (Mongoose), JWT, bcrypt
- Frontend: React (Vite), React Router, Tailwind CSS

## Project Structure

- `server.js` - Express app startup and MongoDB connection
- `routes/auth.js` - Auth API routes
- `models/User.js` - User schema
- `web_frontend/` - React client app

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
- `GET /api/listings` (supports `page`, `limit`, `category`, `condition`, `search`)
- `GET /api/listings/:id`
- `POST /api/listings` (requires token)
- `PUT /api/listings/:id` (requires token, seller only)
- `DELETE /api/listings/:id` (requires token, seller only)

Protected endpoints accept either:
- `Authorization: Bearer <token>`
- `x-auth-token: <token>`

## Notes

- The password reset page exists in the UI, but the reset functionality is not implemented yet.
- Google OAuth, location-based search, and exchange workflow modules are not implemented in the current codebase.
