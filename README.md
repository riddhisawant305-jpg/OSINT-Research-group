# 🚀 CareerVerse

A modern, full-stack career networking and recruitment platform built with the **MERN** stack (MongoDB, Express, React, Node.js) and powered by **Google Gemini AI**.

CareerVerse connects students, job seekers, and recruiters with live community networking, job listings, application tracking, personalized AI career mentoring, resume scoring, and automated resume-to-profile extraction.

---

## 📑 Table of Contents

- [Features](#-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Localhost & Port Overview](#-localhost--port-overview)
- [Prerequisites](#-prerequisites)
- [Initial Setup & Installation](#-initial-setup--installation)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Running the Application](#-running-the-application)
- [Environment Variables](#-environment-variables)
- [Testing & Verification](#-testing--verification)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---

## ✨ Features

### 👤 Profile & Portfolio Management
- **Personal Details & Bio**: Dynamic headline, about summary, location, phone, and customized avatar colors.
- **Projects Showcase**: Add, edit, and delete portfolio projects with title, tech stack tags, live links, and duration.
- **Experience & Education**: Structured tracking of career history, internships, institutions, and degrees.
- **Skills Matrix**: Add and remove technical skills with visual badges and profile strength meter.
- **Interactive Profile Menu**: Hover and click dropdown in the navbar for quick navigation to *View Profile*, *Edit Profile*, and *Logout*.

### 🤖 Gemini AI Career Suite
- **AI Resume-to-Profile Optimizer**: Upload a resume (`.pdf`, `.txt`, `.docx`) or paste resume text. Google Gemini extracts headline, summary, work history, education, skills, and projects, allowing one-click auto-fill directly into your database profile.
- **AI Career Mentor**: Chat with an interactive career coach personalized to your skills, education, and career aspirations.
- **AI Resume Analyzer**: ATS scoring, structural breakdown, identified strengths, weaknesses, and actionable suggestions.

### 💼 Jobs & Recruitment
- **Job Board**: Browse, filter, and search job listings by title, company, or tech stack.
- **One-Click Application**: Submit job applications with resume and cover letter; prevent duplicate applications.
- **Bookmark / Save Jobs**: Save jobs for later viewing with persistent database storage.
- **Recruiter Workflow**: Post job openings and review applicant submissions with status management (`pending`, `reviewed`, `interviewing`, `accepted`, `rejected`).

### 🌐 Community Feed & Networking
- **Live Feed**: Create, view, like, and comment on community posts in real time.
- **Connections / Network**: Send connection requests, accept or decline invitations, and browse your professional network.
- **Real-Time Dashboard**: Visual career statistics and profile completeness metrics.

---

## 🛠 Architecture & Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **React 19** + **Vite 8** | Ultra-fast client-side SPA with Tailwind CSS v4, Lucide & React Icons, Recharts |
| **Backend** | **Node.js** + **Express 5** | RESTful API server with modular controllers, routes, and middleware |
| **Database** | **MongoDB Atlas** + **Mongoose 9** | Cloud NoSQL database with strict schemas and automated connection recovery |
| **AI Integration** | **Google Gemini API** (`gemini-2.5-flash`) | Multimodal LLM powering resume extraction, ATS analysis, and career coaching |
| **Security** | **JWT** + **bcryptjs** | Token-based stateless authentication with salted password hashing (factor 10) |
| **File Handling** | **Multer** | In-memory stream buffer parsing for resumes and document uploads |

---

## 🌐 Localhost & Port Overview

When running locally, CareerVerse utilizes two distinct ports:

| Service | Localhost URL | Purpose |
| :--- | :--- | :--- |
| **Frontend (Client)** | **`http://localhost:5173`** | React user interface (Home, Profile, Jobs, Network, Mentor, etc.) |
| **Backend (Server)** | **`http://localhost:5000`** | Express REST API endpoints (`/api/auth`, `/api/users`, `/api/career`, etc.) |

> **Note:** The frontend communicates with the backend via `http://localhost:5000/api` configured in `frontend/src/api/client.js`.

---

## 📋 Prerequisites

Ensure you have the following installed on your system before proceeding:

1. **Node.js**: Version `v18.x`, `v20.x`, or `v22.x` installed ([Download Node.js](https://nodejs.org/)).
2. **npm**: Version `9.x` or higher (bundled with Node.js).
3. **MongoDB Atlas Account** (or local MongoDB running on `mongodb://localhost:27017`).
4. **Google Gemini API Key**: Free key from [Google AI Studio](https://aistudio.google.com/).

---

## 🚀 Initial Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/riddhisawant305-jpg/OSINT-Research-group.git
cd OSINT-Research-group
```

---

### 2. Backend Setup

Open a terminal and navigate to the `backend` directory:

```bash
cd backend
npm install
```

#### Configure Backend Environment (`.env`)
Create a `.env` file in the `backend/` directory by copying `.env.example`:

```bash
# On Windows PowerShell:
Copy-Item .env.example .env

# On macOS / Linux:
cp .env.example .env
```

Open `backend/.env` and update the values with your credentials:

```env
# Server Port
PORT=5000

# MongoDB Atlas Connection URI
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/careerverse?retryWrites=true&w=majority

# JWT Secret Token Key
JWT_SECRET=your_super_secret_jwt_key_here

# Google Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_from_google_ai_studio
GEMINI_MODEL=gemini-2.5-flash

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

#### (Optional) Seed the Database
Populate your database with sample jobs, users, and posts:

```bash
npm run seed
```

---

### 3. Frontend Setup

Open a second terminal and navigate to the `frontend` directory:

```bash
cd frontend
npm install
```

#### (Optional) Configure Frontend Environment
By default, the frontend connects to `http://localhost:5000/api`. If you ever run your backend on a custom port or domain, you can create a `frontend/.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 💻 Running the Application

To run the full CareerVerse stack locally, start both the backend server and the frontend development server in **two separate terminal windows**:

### Terminal 1: Start Backend Server (`http://localhost:5000`)
```bash
cd backend
npm run dev
```
*You should see output similar to:*
```
Server is running on port 5000
MongoDB Connected Successfully
```

### Terminal 2: Start Frontend Client (`http://localhost:5173`)
```bash
cd frontend
npm run dev
```
*You should see output similar to:*
```
  VITE v8.2.0  ready in 180 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Now open **`http://localhost:5173`** in your web browser!

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | Yes | `5000` | Port on which the Express server listens |
| `MONGO_URI` | Yes | - | MongoDB connection string (Atlas or Local) |
| `JWT_SECRET` | Yes | - | Secret key used to sign and verify JSON Web Tokens |
| `GEMINI_API_KEY` | Yes | - | Google Gemini API Key for AI features |
| `GEMINI_MODEL` | No | `gemini-2.5-flash` | Gemini model version (`gemini-2.5-flash` recommended) |
| `CLIENT_URL` | No | `http://localhost:5173` | Allowed CORS origin for the React frontend |

---

## 🧪 Testing & Verification

### Automated Backend E2E Test Suite
The project includes a 34-point end-to-end automated test suite that validates every API endpoint, MongoDB CRUD operation, security checks, and live Gemini AI integrations.

To run the test suite:
```bash
cd backend
npm test
```
*Expected Output:*
```
=========================================
STARTING CAREERVERSE E2E TEST SUITE
=========================================
✓ PASS: 1-3. Root endpoint GET /
✓ PASS: 4. Register new student user
✓ PASS: 5. Duplicate registration rejected with 409
...
✓ PASS: 36. Projects CRUD (/api/users/me/projects)
✓ PASS: 37. Optimize Profile from Resume via Gemini
=========================================
TEST SUMMARY: 34/34 PASSED
=========================================
```

### Frontend Production Build
To verify frontend TypeScript/JSX compilation and bundling:
```bash
cd frontend
npm run build
```

---

## 📡 API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new student or recruiter account
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET  /api/auth/me` — Retrieve current authenticated user profile
- `POST /api/auth/logout` — Invalidate user session

### User Profile & Projects (`/api/users`)
- `GET    /api/users/me` — Fetch current user profile
- `PUT    /api/users/me` — Update profile details (headline, bio, phone, etc.)
- `GET    /api/users/me/dashboard` — Fetch dashboard metrics and stats
- `POST   /api/users/me/skills` — Add a new skill
- `DELETE /api/users/me/skills/:skill` — Remove a skill
- `POST   /api/users/me/projects` — Add a project to portfolio
- `PUT    /api/users/me/projects/:id` — Update project details
- `DELETE /api/users/me/projects/:id` — Delete a project
- `POST   /api/users/me/experience` — Add work experience entry
- `POST   /api/users/me/education` — Add education entry

### AI Career Suite (`/api/career`)
- `POST /api/career/mentor` — AI Career Mentor advice and interactive coaching
- `POST /api/career/resume-analyzer` — ATS resume evaluation and scoring
- `POST /api/career/optimize-profile-from-resume` — AI Resume extraction and profile optimization

### Jobs & Applications (`/api/jobs`, `/api/applications`)
- `GET    /api/jobs` — Browse jobs with keyword & location filtering
- `GET    /api/jobs/:id` — View full job details
- `POST   /api/jobs` — Create job listing *(Recruiter only)*
- `POST   /api/jobs/:id/save` — Bookmark / save a job
- `POST   /api/jobs/:id/apply` — Apply for a job opening
- `GET    /api/applications/me` — View my submitted applications
- `GET    /api/jobs/:id/applications` — View applicants for a job *(Recruiter only)*
- `PUT    /api/applications/:id/status` — Update application status *(Recruiter only)*

### Community & Networking (`/api/posts`, `/api/connections`)
- `GET    /api/posts` — Get all community posts feed
- `POST   /api/posts` — Create a new post
- `POST   /api/posts/:id/like` — Like or unlike a post
- `POST   /api/posts/:id/comments` — Comment on a post
- `GET    /api/connections` — Get accepted connections network
- `POST   /api/connections/:userId` — Send connection request
- `PUT    /api/connections/:id/accept` — Accept connection request

---

## ❓ Troubleshooting

1. **Blank Screen or "Network Error" on Frontend**:
   - Ensure the backend server is running on port 5000 (`http://localhost:5000`).
   - Check `backend/.env` to confirm `CLIENT_URL=http://localhost:5173` is set.

2. **MongoDB Connection Fails / QuerySrv ECONNREFUSED**:
   - The backend includes automated DNS fallback to Google DNS (`8.8.8.8`).
   - Ensure your IP address is whitelisted in MongoDB Atlas under **Network Access** (`0.0.0.0/0` for development).

3. **Gemini API Key Issues (404 / 429)**:
   - Ensure you use `GEMINI_MODEL=gemini-2.5-flash` in `backend/.env`. Older models like `gemini-1.5-flash` may return 404 depending on API version.
   - Verify your API key is valid at [Google AI Studio](https://aistudio.google.com/).

4. **Port Already in Use**:
   - If port 5000 is occupied, you can kill the existing process or set `PORT=5001` in `backend/.env` and update `VITE_API_URL=http://localhost:5001/api` in `frontend/.env`.

---

## 📄 License

This project is licensed under the ISC License.
