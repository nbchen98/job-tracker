# Applymate

A full-stack job application tracker with a React frontend, Node.js/Express backend, and a Chrome extension.

## 🚀 Live Demo

- **Frontend**: [https://applymate-henna.vercel.app](https://applymate-henna.vercel.app)
- **Backend API**: [https://job-tracker-nghc.onrender.com](https://job-tracker-nghc.onrender.com)
- **Chrome Extension**: Available in the `chrome-extension/` folder

## Features
- Secure authentication (JWT)
- Create, read, update, delete job entries
- Tags, notes, date applied
- Simple dashboard pages

## Tech Stack
- Backend: Node.js, Express, PostgreSQL, JWT, bcrypt, CORS
- Frontend: React (Vite), React Router, Tailwind CSS, Axios
- Extension: Chrome Manifest V3

## Prerequisites
- Node.js >= 18
- PostgreSQL

## Quick Start

### 1) Install dependencies
```bash
# From project root
npm run install-all
```

### 2) Configure environment
```bash
# In backend
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL and a strong JWT_SECRET
```

### 3) Create database tables
Use your PostgreSQL client to run:
```sql
-- Enable RLS (for Supabase)
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS jobs ENABLE ROW LEVEL SECURITY;

-- Drop tables if they exist
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

-- Create jobs table
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  link TEXT,
  status TEXT DEFAULT 'applied',
  date_applied DATE,
  notes TEXT,
  tags TEXT[]
);

-- Add RLS policies (for Supabase)
CREATE POLICY "Allow all users access"
ON users FOR ALL USING (true);

CREATE POLICY "Allow all jobs access"
ON jobs FOR ALL USING (true);
```

### 4) Run the app (dev)
```bash
# From project root
npm run dev
# Frontend: http://localhost:5173
# Backend:  http://localhost:5000 (or env PORT)
```

## API (brief)
- POST `/auth/register`  → { email, password }
- POST `/auth/login`     → { email, password } → { token }
- GET  `/api/jobs`       → list user jobs (auth)
- GET  `/api/jobs/:id`   → job by id (auth)
- POST `/api/jobs`       → create job (auth)
- PUT  `/api/jobs/:id`   → update job (auth)
- DELETE `/api/jobs/:id` → delete job (auth)

## Project Structure
```
applymate/
├── backend/
│   ├── controllers/     # business logic
│   ├── middleware/      # auth middleware
│   ├── models/          # database connection
│   ├── routes/          # API routes
│   └── index.js         # server entry
├── frontend/
│   └── src/             # React app
├── chrome-extension/    # browser extension
├── .gitignore
├── .env.example
└── README.md
```

## Scripts
From project root:
```bash
npm run dev          # run backend + frontend
npm run backend      # run backend only
npm run frontend     # run frontend only
npm run install-all  # install root, backend, frontend deps
```

License: MIT
