import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppLayout from "./component/AppLayout";

import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

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
import Roadmap from "./pages/Roadmap";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./component/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route element={<AppLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/network" element={<Connections />} />
            <Route path="/create-post" element={<CreatePost />} />

            <Route path="/mentor" element={<Mentor />} />
            <Route path="/resume" element={<ResumeAnalyzer />} />
            <Route path="/interview" element={<MockInterview />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route path="*" element={<Welcome />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ErrorBoundary>
  );
}

export default App;
