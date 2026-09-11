import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import AppLayout from "./component/AppLayout";

import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Home from "./pages/Home";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";
import Connections from "./pages/Connections";
import CreatePost from "./pages/CreatePost";

import Mentor from "./pages/Mentor";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import MockInterview from "./pages/MockInterview";
import PracticeInterview from "./pages/PracticeInterview";
import Dashboard from "./pages/Dashboard";
import HiredEmployees from "./pages/HiredEmployees";
import AdminDashboard from "./pages/AdminDashboard";
import AboutUs from "./pages/AboutUs";
import ContactSupport from "./pages/ContactSupport";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ErrorBoundary from "./component/ErrorBoundary";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    const isOrg = user.role === "organization" || user.role === "recruiter";
    return <Navigate to={isOrg ? "/dashboard" : "/home"} replace />;
  }

  return children;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public-only routes: redirect to /home or /dashboard if already logged in */}
            <Route path="/" element={<PublicOnlyRoute><Welcome /></PublicOnlyRoute>} />
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
            <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
            <Route path="/reset-password/:token" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Application routes inside AppLayout */}
            <Route element={<AppLayout />}>
              {/* Authenticated user routes */}
              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
              <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
              <Route path="/jobs/:id" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/network" element={<ProtectedRoute><Connections /></ProtectedRoute>} />
              <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />

              <Route path="/mentor" element={<ProtectedRoute><Mentor /></ProtectedRoute>} />
              <Route path="/resume" element={<ProtectedRoute><ResumeAnalyzer /></ProtectedRoute>} />
              <Route path="/interview" element={<ProtectedRoute><PracticeInterview /></ProtectedRoute>} />
              <Route path="/practice-interview" element={<ProtectedRoute><PracticeInterview /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/hired" element={<ProtectedRoute><HiredEmployees /></ProtectedRoute>} />
              <Route path="/hired-employees" element={<ProtectedRoute><HiredEmployees /></ProtectedRoute>} />

              {/* Public informational pages */}
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactSupport />} />
              <Route path="/support" element={<ContactSupport />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
