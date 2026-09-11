# CareerVerse

## Overview & Core Features

CareerVerse is a professional networking and career platform connecting students, job seekers, and hiring organizations.

### 👤 Candidate (User) Features
- **Profiles & Networking**: Build a professional profile, send and accept connection requests, and grow your network.
- **Feed & Community Posts**: Share updates with text, images, videos, or documents; like and comment on connections' posts.
- **Job Applications**: Explore active job openings, filter opportunities, and apply directly with your resume.

### 🏢 Organization Features
- **Job Listings**: Create, publish, and manage company job openings with details on role, location, salary, and requirements.
- **Applicant Review & Hiring**: Track applications, view candidate profiles, download submitted PDF resumes, and update applicant statuses (Reviewed, Interviewing, Accepted, Rejected).

### 🔐 Google OAuth Authentication
- Quick, one-click sign-in and account registration for both candidates and organizations using Google Identity Services (GIS).

### 📧 SMTP Email Service
- Automated notification emails with a semi-formal, modern design:
  - Welcome emails upon registration.
  - Social notifications for post likes, comments, and connection requests.
  - Real-time job application confirmations for candidates and recruiter alerts with attached applicant resumes.
  - Candidate hiring notifications when an application is accepted.
  - Network updates when connections publish new posts or list jobs.
  - Forgot password and reset password verification links.

### 🛡️ Super Admin Dashboard (`/admin`)
- **Operations & Metrics**: Real-time platform monitoring (total users, organizations, active jobs, posts, and online status).
- **CareerVerse Verified Badge**: Award or revoke verification badges for candidates and companies.
- **Moderation with Mandatory Reason**: Delete posts, jobs, users, or organizations with a required reason prompt that is automatically dispatched via email to the affected owner.
- **Direct Custom Email**: Compose and send official administrative communications directly to any registered candidate or organization.

---

## Prerequisites

Ensure you have the following installed on your system before proceeding:

1. **Node.js**: Version `v18.x`, `v20.x`, or `v22.x` installed ([Download Node.js](https://nodejs.org/)).
2. **npm**: Version `9.x` or higher (bundled with Node.js).
3. **MongoDB Atlas Account** (or local MongoDB running on `mongodb://localhost:27017`).
4. **Google Gemini API Key**: Free key from [Google AI Studio](https://aistudio.google.com/).

---

## Initial Setup and Installs

Clone the repository and enter the project folder:

```bash
git clone https://github.com/riddhisawant305-jpg/OSINT-Research-group.git
cd OSINT-Research-group
```

---

## Backend Setup

1. Open a terminal and navigate to the `backend` directory:
```bash
cd backend
npm install
```

2. Create a `.env` file in the `backend/` directory by copying `.env.example`:
```bash
# On Windows PowerShell:
Copy-Item .env.example .env

# On macOS / Linux:
cp .env.example .env
```

3. Open `backend/.env` and update the values with your credentials (see [Environment Variables](#environment-variables)).

4. *(Optional)* Seed the database with sample data:
```bash
npm run seed
```

---

## Frontend Setup

1. Open a second terminal and navigate to the `frontend` directory:
```bash
cd frontend
npm install
```

2. *(Optional)* By default, the frontend connects to `http://localhost:5000/api`. If you run your backend on a custom port, create a `frontend/.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Running Application

Start both the backend server and frontend development server in **two separate terminal windows**:

### Terminal 1: Start Backend Server (`http://localhost:5000`)
```bash
cd backend
npm run dev
```

### Terminal 2: Start Frontend Client (`http://localhost:5173`)
```bash
cd frontend
npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | Yes | `5000` | Port on which the Express server listens |
| `MONGO_URI` | Yes | - | MongoDB Atlas connection URI |
| `JWT_SECRET` | Yes | - | Secret key used to sign and verify JSON Web Tokens |
| `GEMINI_API_KEY` | Yes | - | Google Gemini API Key for AI features |
| `GEMINI_MODEL` | No | `gemini-2.5-flash` | Gemini model version (`gemini-2.5-flash` recommended) |
| `CLIENT_URL` | No | `http://localhost:5173` | Allowed CORS origin for the React frontend |
| `GOOGLE_CLIENT_ID` | Yes | - | Google Cloud OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | - | Google Cloud OAuth 2.0 Client Secret |
| `SMTP_HOST` | Yes | `smtp.gmail.com` | SMTP host server address |
| `SMTP_PORT` | Yes | `587` | SMTP port (587 for TLS, 465 for SSL) |
| `SMTP_USERNAME` | Yes | - | SMTP authenticated account email |
| `SMTP_PASSWORD` | Yes | - | SMTP account / app password |
| `MAIL_FROM` | No | `"CareerVerse" <noreply@careerverse.com>` | Default sender display name and address |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | No | `http://localhost:5000/api` | Backend API base URL |
| `VITE_GOOGLE_CLIENT_ID` | Yes | - | Google OAuth 2.0 Web Client ID |

