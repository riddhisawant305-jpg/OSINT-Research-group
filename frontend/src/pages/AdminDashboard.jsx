import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Users,
  Building,
  Briefcase,
  FileText,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  LogOut,
  ExternalLink,
  MessageSquare,
  Search,
  Bell,
  RefreshCw,
  Send,
  Download,
  AlertTriangle,
  X,
  Clock,
  Radio,
  Mail,
} from "lucide-react";
import API from "../api/client";
import { useAuth } from "../context/AuthContext";
import VerifiedBadge from "../component/VerifiedBadge";
import {
  currentUser as dummyCurrentUser,
  users as dummyUsers,
  posts as dummyPosts,
  jobs as dummyJobs,
} from "../data/dummyData";
import "./AdminDashboard.css";

const BACKEND_URL = "http://localhost:5000";

// Robust fallback datasets mirroring database schema for offline or initial preview
const fallbackCandidates = [
  {
    _id: "cand_1",
    name: dummyCurrentUser.name,
    email: dummyCurrentUser.email,
    headline: dummyCurrentUser.headline,
    location: dummyCurrentUser.location,
    role: "student",
    isLoggedIn: true,
    isVerified: true,
    lastLogin: new Date().toISOString(),
    resume: "/uploads/resumes/sample_resume.pdf",
    resumeFileName: "Darshan_Kamble_Resume.pdf",
    postsCount: 2,
    applicationsCount: 3,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  ...dummyUsers.map((u, i) => ({
    _id: `cand_${u.id || i + 2}`,
    name: u.name,
    email: `${u.name.toLowerCase().replace(/\s+/g, ".")}@careerverse.example`,
    headline: u.headline,
    location: u.location,
    role: "student",
    isLoggedIn: i % 2 === 0,
    lastLogin: new Date(Date.now() - 86400000 * (i + 1)).toISOString(),
    resume: i % 2 === 0 ? "/uploads/resumes/sample_resume.pdf" : null,
    resumeFileName: i % 2 === 0 ? `${u.name.replace(/\s+/g, "_")}_Resume.pdf` : null,
    postsCount: (i % 3) + 1,
    applicationsCount: (i % 4) + 1,
    createdAt: new Date(Date.now() - 86400000 * (i + 10)).toISOString(),
  })),
];

const fallbackOrgs = [
  {
    _id: "org_1",
    name: "TechNova Solutions",
    companyName: "TechNova",
    email: "hr@technova.example.com",
    companyIndustry: "Software & Technology",
    location: "Bengaluru, India",
    role: "organization",
    isLoggedIn: true,
    lastLogin: new Date().toISOString(),
    jobsCount: 3,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    _id: "org_2",
    name: "DesignLab Studio",
    companyName: "DesignLab",
    email: "careers@designlab.example.com",
    companyIndustry: "Design & UX",
    location: "Mumbai, India",
    role: "organization",
    isLoggedIn: false,
    lastLogin: new Date(Date.now() - 86400000 * 2).toISOString(),
    jobsCount: 2,
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
  },
  {
    _id: "org_3",
    name: "CloudBase Systems",
    companyName: "CloudBase",
    email: "talent@cloudbase.example.com",
    companyIndustry: "Cloud Computing",
    location: "Hyderabad, India",
    role: "organization",
    isLoggedIn: true,
    lastLogin: new Date().toISOString(),
    jobsCount: 4,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    _id: "org_4",
    name: "InsightsCo Analytics",
    companyName: "InsightsCo",
    email: "jobs@insightsco.example.com",
    companyIndustry: "Data & AI",
    location: "Pune, India",
    role: "organization",
    isLoggedIn: false,
    lastLogin: new Date(Date.now() - 86400000 * 5).toISOString(),
    jobsCount: 2,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
];

const fallbackPostsList = dummyPosts.map((p, i) => ({
  _id: `post_${p.id || i + 1}`,
  content: p.content,
  author: {
    _id: `author_${p.user?.id || i}`,
    name: p.user?.name || "Community Member",
    email: `${(p.user?.name || "user").toLowerCase().replace(/\s+/g, ".")}@careerverse.example`,
    role: "student",
    headline: p.user?.headline || "Software Engineer",
  },
  likes: Array.isArray(p.likes) ? p.likes : Array(p.likes || 5).fill("like"),
  shares: p.shares || 0,
  comments: p.comments || 0,
  createdAt: new Date(Date.now() - 3600000 * (i * 4 + 1)).toISOString(),
}));

const fallbackJobsList = dummyJobs.map((j, i) => ({
  _id: `job_${j.id || i + 1}`,
  title: j.title,
  company: j.company,
  location: j.location,
  type: j.type,
  salary: j.salary,
  description: j.description,
  skills: j.skills || [],
  applicants: Array.isArray(j.applicants) ? j.applicants : Array(j.applicants || 12).fill("applicant"),
  recruiter: {
    name: j.company,
    companyName: j.company,
    email: `careers@${j.company.toLowerCase().replace(/\s+/g, "")}.example.com`,
  },
  createdAt: new Date(Date.now() - 86400000 * (i * 2 + 1)).toISOString(),
}));

const fallbackStatsData = {
  totalUsers: fallbackCandidates.length,
  totalOrganizations: fallbackOrgs.length,
  onlineUsers: fallbackCandidates.filter((c) => c.isLoggedIn).length + fallbackOrgs.filter((o) => o.isLoggedIn).length,
  totalPosts: fallbackPostsList.length,
  totalJobs: fallbackJobsList.length,
  totalApplications: 28,
};

function AdminDashboard() {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();

  // Admin authentication state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(
    () => localStorage.getItem("cv_admin_token") !== null || currentUser?.role === "admin"
  );
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem("cv_admin_token") || "");
  const [loginEmail, setLoginEmail] = useState("admin@careerverse.com");
  const [loginPassword, setLoginPassword] = useState("Admin123!");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'candidates', 'organizations', 'posts', 'jobs'

  // Data states initialized with rich fallback data so dashboard is never empty
  const [stats, setStats] = useState(fallbackStatsData);
  const [usersList, setUsersList] = useState(fallbackCandidates);
  const [orgsList, setOrgsList] = useState(fallbackOrgs);
  const [postsList, setPostsList] = useState(fallbackPostsList);
  const [jobsList, setJobsList] = useState(fallbackJobsList);
  const [loadingData, setLoadingData] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [userPostsModal, setUserPostsModal] = useState({ open: false, user: null, posts: [], loading: false });
  const [orgJobsModal, setOrgJobsModal] = useState({ open: false, org: null, jobs: [], loading: false });
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({ title: "", text: "" });
  const [broadcasting, setBroadcasting] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    type: "", // "user" | "post" | "org" | "job"
    item: null,
    title: "",
    recipientInfo: "",
    reason: "",
    loading: false,
  });
  const [customEmailModal, setCustomEmailModal] = useState({
    open: false,
    to: "",
    recipientName: "",
    subject: "",
    message: "",
    loading: false,
  });

  // Configure axios auth header helper for admin calls
  const getAdminHeaders = (tokenOverride) => {
    const token = tokenOverride || localStorage.getItem("cv_admin_token") || localStorage.getItem("cv_token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // -----------------------------------------------------------
  // ADMIN AUTHENTICATION
  // -----------------------------------------------------------
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);

    try {
      const res = await API.post("/admin/login", {
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (res.data && res.data.token) {
        localStorage.setItem("cv_admin_token", res.data.token);
        setAdminToken(res.data.token);
        setIsAdminLoggedIn(true);
        await loadAllAdminData(res.data.token);
      }
    } catch (err) {
      setLoginError(err.response?.data?.message || "Invalid admin credentials.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("cv_admin_token");
    setIsAdminLoggedIn(false);
    setAdminToken("");
    setIsLiveConnected(false);
    if (currentUser?.role === "admin") {
      logout();
    }
    navigate("/admin");
  };

  // -----------------------------------------------------------
  // DATA LOADING
  // -----------------------------------------------------------
  const loadAllAdminData = async (tokenOverride) => {
    setLoadingData(true);
    const headers = getAdminHeaders(tokenOverride);

    try {
      const [statsRes, usersRes, orgsRes, postsRes, jobsRes] = await Promise.allSettled([
        API.get("/admin/stats", headers),
        API.get("/admin/users", headers),
        API.get("/admin/organizations", headers),
        API.get("/admin/posts", headers),
        API.get("/admin/jobs", headers),
      ]);

      // Check if unauthorized (401 / 403)
      const authRejection = [statsRes, usersRes, orgsRes, postsRes, jobsRes].find(
        (r) =>
          r.status === "rejected" &&
          (r.reason?.response?.status === 401 || r.reason?.response?.status === 403)
      );

      if (authRejection) {
        console.warn("Admin unauthorized:", authRejection.reason?.response?.data?.message);
        localStorage.removeItem("cv_admin_token");
        setIsAdminLoggedIn(false);
        setIsLiveConnected(false);
        setLoginError("Your admin session has expired or requires administrative privileges. Please log in.");
        return;
      }

      let anyFulfilled = false;

      if (statsRes.status === "fulfilled" && statsRes.value.data?.data) {
        setStats(statsRes.value.data.data);
        anyFulfilled = true;
      }
      if (usersRes.status === "fulfilled" && Array.isArray(usersRes.value.data?.data)) {
        setUsersList(usersRes.value.data.data);
        anyFulfilled = true;
      }
      if (orgsRes.status === "fulfilled" && Array.isArray(orgsRes.value.data?.data)) {
        setOrgsList(orgsRes.value.data.data);
        anyFulfilled = true;
      }
      if (postsRes.status === "fulfilled" && Array.isArray(postsRes.value.data?.data)) {
        setPostsList(postsRes.value.data.data);
        anyFulfilled = true;
      }
      if (jobsRes.status === "fulfilled" && Array.isArray(jobsRes.value.data?.data)) {
        setJobsList(jobsRes.value.data.data);
        anyFulfilled = true;
      }

      setIsLiveConnected(anyFulfilled);
    } catch (err) {
      console.warn("Failed to load admin dataset:", err.message);
      setIsLiveConnected(false);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAdminLoggedIn) {
      loadAllAdminData();
    }
  }, [isAdminLoggedIn]);

  // -----------------------------------------------------------
  // ACTIONS: MODERATION & DELETIONS WITH REASON
  // -----------------------------------------------------------
  const handlePromptDeleteUser = (user) => {
    setDeleteModal({
      open: true,
      type: "user",
      item: user,
      title: `Delete Candidate: ${user.name}`,
      recipientInfo: `An official notification with the deletion reason will be emailed to ${user.email}.`,
      reason: "",
      loading: false,
    });
  };

  const handlePromptDeleteOrg = (org) => {
    const orgName = org.companyName || org.name || "Organization";
    setDeleteModal({
      open: true,
      type: "org",
      item: org,
      title: `Delete Organization: ${orgName}`,
      recipientInfo: `An official notification with the deletion reason will be emailed to ${org.email}.`,
      reason: "",
      loading: false,
    });
  };

  const handlePromptDeletePost = (postOrId) => {
    let post = postOrId;
    if (typeof postOrId === "string") {
      post = postsList.find((p) => p._id === postOrId) || userPostsModal.posts.find((p) => p._id === postOrId) || { _id: postOrId };
    }
    const authorName = post.author?.name || "Candidate";
    const authorEmail = post.author?.email || "author's registered email";
    setDeleteModal({
      open: true,
      type: "post",
      item: post,
      title: `Delete Community Post`,
      recipientInfo: `Author: ${authorName}. An email explaining this deletion will be sent to ${authorEmail}.`,
      reason: "",
      loading: false,
    });
  };

  const handlePromptDeleteJob = (jobOrId) => {
    let job = jobOrId;
    if (typeof jobOrId === "string") {
      job = jobsList.find((j) => (j._id || j.numericId) === jobOrId) || orgJobsModal.jobs.find((j) => (j._id || j.numericId) === jobOrId) || { _id: jobOrId };
    }
    const company = job.company || job.recruiter?.name || "Hiring Organization";
    const contactEmail = job.recruiter?.email || "the organization's registered email";
    setDeleteModal({
      open: true,
      type: "job",
      item: job,
      title: `Delete Job Opening: ${job.title || "Job"}`,
      recipientInfo: `Organization: ${company}. An email explaining this deletion will be dispatched to ${contactEmail}.`,
      reason: "",
      loading: false,
    });
  };

  const handleConfirmDeleteWithReason = async (e) => {
    if (e) e.preventDefault();
    if (!deleteModal.reason.trim()) {
      alert("Please enter a specific reason for this deletion. It will be emailed to the affected party.");
      return;
    }

    setDeleteModal((prev) => ({ ...prev, loading: true }));
    const reasonText = deleteModal.reason.trim();

    try {
      if (deleteModal.type === "user") {
        const userId = deleteModal.item._id || deleteModal.item.id;
        await API.delete(`/admin/users/${userId}`, {
          ...getAdminHeaders(),
          data: { reason: reasonText },
          params: { reason: reasonText },
        });
        setUsersList((prev) => prev.filter((u) => (u._id || u.id) !== userId));
        setStats((prev) => ({ ...prev, totalUsers: Math.max(0, prev.totalUsers - 1) }));
        alert(`Candidate user deleted and reason email dispatched.`);
      } else if (deleteModal.type === "org") {
        const orgId = deleteModal.item._id || deleteModal.item.id;
        await API.delete(`/admin/organizations/${orgId}`, {
          ...getAdminHeaders(),
          data: { reason: reasonText },
          params: { reason: reasonText },
        });
        setOrgsList((prev) => prev.filter((o) => (o._id || o.id) !== orgId));
        setStats((prev) => ({ ...prev, totalOrganizations: Math.max(0, prev.totalOrganizations - 1) }));
        alert(`Organization deleted and reason email dispatched.`);
      } else if (deleteModal.type === "post") {
        const postId = deleteModal.item._id || deleteModal.item.id || deleteModal.item;
        await API.delete(`/admin/posts/${postId}`, {
          ...getAdminHeaders(),
          data: { reason: reasonText },
          params: { reason: reasonText },
        });
        setUserPostsModal((prev) => ({
          ...prev,
          posts: prev.posts.filter((p) => p._id !== postId),
        }));
        setPostsList((prev) => prev.filter((p) => p._id !== postId));
        setStats((prev) => ({ ...prev, totalPosts: Math.max(0, prev.totalPosts - 1) }));
        alert(`Post deleted and reason email dispatched to author.`);
      } else if (deleteModal.type === "job") {
        const jobId = deleteModal.item._id || deleteModal.item.numericId || deleteModal.item.id || deleteModal.item;
        await API.delete(`/admin/jobs/${jobId}`, {
          ...getAdminHeaders(),
          data: { reason: reasonText },
          params: { reason: reasonText },
        });
        setOrgJobsModal((prev) => ({
          ...prev,
          jobs: prev.jobs.filter((j) => (j._id || j.numericId || j.id) !== jobId),
        }));
        setJobsList((prev) => prev.filter((j) => (j._id || j.numericId || j.id) !== jobId));
        setStats((prev) => ({ ...prev, totalJobs: Math.max(0, prev.totalJobs - 1) }));
        alert(`Job listing deleted and reason email dispatched to organization.`);
      }

      setDeleteModal({ open: false, type: "", item: null, title: "", recipientInfo: "", reason: "", loading: false });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to process deletion.");
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleOpenUserPosts = async (user) => {
    setUserPostsModal({ open: true, user, posts: [], loading: true });
    try {
      const res = await API.get(`/admin/users/${user._id}/posts`, getAdminHeaders());
      setUserPostsModal({ open: true, user, posts: res.data.data || [], loading: false });
    } catch (err) {
      console.warn("Could not load user posts:", err.message);
      setUserPostsModal({ open: true, user, posts: [], loading: false });
    }
  };

  const handleOpenOrgJobs = async (org) => {
    setOrgJobsModal({ open: true, org, jobs: [], loading: true });
    try {
      const res = await API.get(`/admin/organizations/${org._id}/jobs`, getAdminHeaders());
      setOrgJobsModal({ open: true, org, jobs: res.data.data || [], loading: false });
    } catch (err) {
      console.warn("Could not load organization jobs:", err.message);
      setOrgJobsModal({ open: true, org, jobs: [], loading: false });
    }
  };

  // -----------------------------------------------------------
  // ACTIONS: CUSTOM DIRECT EMAIL
  // -----------------------------------------------------------
  const handleOpenCustomEmail = (recipient = null) => {
    setCustomEmailModal({
      open: true,
      to: recipient?.email || "",
      recipientName: recipient?.companyName || recipient?.name || "",
      subject: "",
      message: "",
      loading: false,
    });
  };

  const handleSendCustomEmail = async (e) => {
    e.preventDefault();
    if (!customEmailModal.to.trim() || !customEmailModal.subject.trim() || !customEmailModal.message.trim()) {
      alert("Please fill in recipient email, subject, and message content.");
      return;
    }

    setCustomEmailModal((prev) => ({ ...prev, loading: true }));
    try {
      const res = await API.post(
        "/admin/send-email",
        {
          to: customEmailModal.to.trim(),
          recipientName: customEmailModal.recipientName.trim(),
          subject: customEmailModal.subject.trim(),
          message: customEmailModal.message.trim(),
        },
        getAdminHeaders()
      );
      alert(res.data?.message || "Email dispatched successfully!");
      setCustomEmailModal({ open: false, to: "", recipientName: "", subject: "", message: "", loading: false });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send email.");
      setCustomEmailModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // -----------------------------------------------------------
  // ACTIONS: VERIFY USER OR ORGANIZATION (CareerVerse Verified)
  // -----------------------------------------------------------
  const handleToggleVerify = async (entity, type = "user") => {
    const targetId = entity._id || entity.id;
    const currentStatus = !!entity.isVerified;
    const nextStatus = !currentStatus;
    const entityName = entity.companyName || entity.name || "Account";

    try {
      // Optimistic update
      if (type === "user") {
        setUsersList((prev) =>
          prev.map((u) => ((u._id || u.id) === targetId ? { ...u, isVerified: nextStatus } : u))
        );
      } else {
        setOrgsList((prev) =>
          prev.map((o) => ((o._id || o.id) === targetId ? { ...o, isVerified: nextStatus } : o))
        );
      }

      const res = await API.put(
        `/admin/verify/${targetId}`,
        { isVerified: nextStatus },
        getAdminHeaders()
      );

      if (res.data?.data) {
        const updatedStatus = res.data.data.isVerified;
        if (type === "user") {
          setUsersList((prev) =>
            prev.map((u) => ((u._id || u.id) === targetId ? { ...u, isVerified: updatedStatus } : u))
          );
        } else {
          setOrgsList((prev) =>
            prev.map((o) => ((o._id || o.id) === targetId ? { ...o, isVerified: updatedStatus } : o))
          );
        }
      }
    } catch (err) {
      // Revert optimistic update
      if (type === "user") {
        setUsersList((prev) =>
          prev.map((u) => ((u._id || u.id) === targetId ? { ...u, isVerified: currentStatus } : u))
        );
      } else {
        setOrgsList((prev) =>
          prev.map((o) => ((o._id || o.id) === targetId ? { ...o, isVerified: currentStatus } : o))
        );
      }
      alert(err.response?.data?.message || "Failed to update CareerVerse verification status.");
    }
  };

  // -----------------------------------------------------------
  // ACTIONS: SYSTEM BROADCAST
  // -----------------------------------------------------------
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.text.trim()) return;

    setBroadcasting(true);
    try {
      const res = await API.post("/admin/broadcast", broadcastForm, getAdminHeaders());
      alert(res.data.message || "Broadcast notification sent to all users.");
      setBroadcastModalOpen(false);
      setBroadcastForm({ title: "", text: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to broadcast notification.");
    } finally {
      setBroadcasting(false);
    }
  };

  // Helper to open resume
  const handleOpenResume = (resumePath) => {
    if (!resumePath) return;
    const url = resumePath.startsWith("http")
      ? resumePath
      : `${BACKEND_URL}${resumePath.startsWith("/") ? "" : "/"}${resumePath}`;
    window.open(url, "_blank");
  };

  // -----------------------------------------------------------
  // RENDER: LOGIN FORM (If not authenticated as admin)
  // -----------------------------------------------------------
  if (!isAdminLoggedIn) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-card">
          <div className="admin-login-badge">
            <Shield size={32} color="#2563eb" />
          </div>
          <h2>CareerVerse Admin Portal</h2>
          <p className="admin-login-sub">
            Restricted access. Sign in with administrative credentials to manage platform users, organizations, and moderation.
          </p>

          {loginError && <div className="admin-alert-danger">{loginError}</div>}

          <form onSubmit={handleAdminLogin} className="admin-login-form">
            <div className="admin-form-group">
              <label>Admin Email</label>
              <input
                type="email"
                placeholder="admin@careerverse.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Admin Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="admin-login-btn" disabled={loggingIn}>
              {loggingIn ? "Verifying Credentials..." : "Enter Admin Dashboard"}
            </button>
          </form>

          <div className="admin-login-hint">
            <strong>Default Credentials:</strong>
            <code>admin@careerverse.com</code> / <code>Admin123!</code>
          </div>

          <button
            type="button"
            className="admin-back-link"
            onClick={() => navigate("/home")}
          >
            ← Return to CareerVerse Home
          </button>
        </div>
      </div>
    );
  }

  // Filtered users and organizations
  const filteredUsers = usersList.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrgs = orgsList.filter(
    (o) =>
      (o.companyName || o.name)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.companyIndustry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-dashboard-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-logo-box">
            <Shield size={24} color="#3b82f6" />
            <span className="admin-logo-text">
              Career<strong>Verse</strong> Admin
            </span>
          </div>
          <span className="admin-access-tag">SuperAdmin</span>
        </div>

        <nav className="admin-nav-menu">
          <button
            className={`admin-nav-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <Radio size={18} /> Platform Overview
          </button>
          <button
            className={`admin-nav-item ${activeTab === "candidates" ? "active" : ""}`}
            onClick={() => setActiveTab("candidates")}
          >
            <Users size={18} /> Candidates ({usersList.length})
          </button>
          <button
            className={`admin-nav-item ${activeTab === "organizations" ? "active" : ""}`}
            onClick={() => setActiveTab("organizations")}
          >
            <Building size={18} /> Organizations ({orgsList.length})
          </button>
          <button
            className={`admin-nav-item ${activeTab === "posts" ? "active" : ""}`}
            onClick={() => setActiveTab("posts")}
          >
            <MessageSquare size={18} /> Posts Moderation ({postsList.length})
          </button>
          <button
            className={`admin-nav-item ${activeTab === "jobs" ? "active" : ""}`}
            onClick={() => setActiveTab("jobs")}
          >
            <Briefcase size={18} /> Job Listings ({jobsList.length})
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button
            className="admin-broadcast-btn"
            style={{ marginBottom: 8, background: "#0284c7" }}
            onClick={() => handleOpenCustomEmail()}
          >
            <Mail size={16} /> Compose Email
          </button>
          <button
            className="admin-broadcast-btn"
            onClick={() => setBroadcastModalOpen(true)}
          >
            <Bell size={16} /> Broadcast Notification
          </button>
          <button className="admin-logout-btn" onClick={handleAdminLogout}>
            <LogOut size={16} /> Sign Out Admin
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-viewport">
        {/* Top Navbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-title">
            <h2>
              {activeTab === "overview" && "Platform Operations & Metrics"}
              {activeTab === "candidates" && "Candidate Users Directory"}
              {activeTab === "organizations" && "Hiring Organizations Directory"}
              {activeTab === "posts" && "Platform Posts & Feed Moderation"}
              {activeTab === "jobs" && "Active Job Openings Moderation"}
            </h2>
            <p>Live administration portal for monitoring and moderating CareerVerse.</p>
          </div>

          <div className="admin-topbar-actions">
            <div className={`admin-status-pill ${isLiveConnected ? "live" : "offline"}`}>
              <span className="admin-status-dot"></span>
              {isLiveConnected ? "Live Database Connected" : "Preview Mode (Offline)"}
            </div>
            <button
              className="admin-refresh-btn"
              onClick={() => loadAllAdminData()}
              disabled={loadingData}
              title="Refresh dataset"
            >
              <RefreshCw size={16} className={loadingData ? "animate-spin" : ""} /> Refresh
            </button>
            <button
              className="admin-home-btn"
              onClick={() => navigate("/home")}
            >
              <ExternalLink size={16} /> Open User View
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="admin-content-body">
          {!isLiveConnected && (
            <div className="admin-preview-banner">
              <AlertTriangle size={16} />
              <span>Displaying cached preview data. Ensure backend is running and click "Refresh" to sync with live MongoDB Atlas.</span>
            </div>
          )}
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="admin-overview-section">
              <div className="admin-metric-grid">
                <div className="admin-metric-card">
                  <div className="metric-icon-wrap" style={{ background: "#eff6ff", color: "#2563eb" }}>
                    <Users size={22} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-num">{stats.totalUsers}</span>
                    <span className="metric-label">Candidates / Students</span>
                  </div>
                </div>

                <div className="admin-metric-card">
                  <div className="metric-icon-wrap" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                    <Building size={22} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-num">{stats.totalOrganizations}</span>
                    <span className="metric-label">Hiring Organizations</span>
                  </div>
                </div>

                <div className="admin-metric-card">
                  <div className="metric-icon-wrap" style={{ background: "#fef3c7", color: "#d97706" }}>
                    <Radio size={22} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-num" style={{ color: "#16a34a" }}>
                      🟢 {stats.onlineUsers}
                    </span>
                    <span className="metric-label">Currently Online Users</span>
                  </div>
                </div>

                <div className="admin-metric-card">
                  <div className="metric-icon-wrap" style={{ background: "#faf5ff", color: "#9333ea" }}>
                    <MessageSquare size={22} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-num">{stats.totalPosts}</span>
                    <span className="metric-label">Community Posts</span>
                  </div>
                </div>

                <div className="admin-metric-card">
                  <div className="metric-icon-wrap" style={{ background: "#ecfeff", color: "#0891b2" }}>
                    <Briefcase size={22} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-num">{stats.totalJobs}</span>
                    <span className="metric-label">Job Postings Listed</span>
                  </div>
                </div>

                <div className="admin-metric-card">
                  <div className="metric-icon-wrap" style={{ background: "#fff1f2", color: "#e11d48" }}>
                    <FileText size={22} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-num">{stats.totalApplications}</span>
                    <span className="metric-label">Total Job Applications</span>
                  </div>
                </div>
              </div>

              {/* Quick Jump Panels */}
              <div className="admin-quick-panels">
                <div className="admin-quick-card">
                  <div className="quick-card-head">
                    <h3>Recent Candidates</h3>
                    <button className="quick-see-all" onClick={() => setActiveTab("candidates")}>
                      View All →
                    </button>
                  </div>
                  <div className="quick-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Status</th>
                          <th>Verified</th>
                          <th>Resume</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersList.slice(0, 5).map((u) => (
                          <tr key={u._id}>
                            <td>
                              <div className="user-primary-name-row">
                                <strong>{u.name}</strong>
                                {u.isVerified && <VerifiedBadge size={14} />}
                              </div>
                              <small>{u.email}</small>
                            </td>
                            <td>
                              {u.isLoggedIn ? (
                                <span className="status-pill status-online">🟢 Online</span>
                              ) : (
                                <span className="status-pill status-offline">⚪ Offline</span>
                              )}
                            </td>
                            <td>
                              <button
                                className={`admin-verify-btn ${u.isVerified ? "verified" : ""}`}
                                onClick={() => handleToggleVerify(u, "user")}
                                title={u.isVerified ? "Revoke CareerVerse Verified status" : "Award CareerVerse Verified badge"}
                              >
                                <CheckCircle size={12} />
                                <span>{u.isVerified ? "Verified" : "Verify"}</span>
                              </button>
                            </td>
                            <td>
                              {u.resume ? (
                                <button
                                  className="admin-link-btn"
                                  onClick={() => handleOpenResume(u.resume)}
                                >
                                  <Download size={13} /> View PDF
                                </button>
                              ) : (
                                <span className="text-muted">No resume</span>
                              )}
                            </td>
                            <td>
                              <button
                                className="admin-email-btn"
                                style={{ marginRight: 6 }}
                                onClick={() => handleOpenCustomEmail(u)}
                                title="Send email to candidate"
                              >
                                <Mail size={13} />
                              </button>
                              <button
                                className="admin-danger-btn"
                                onClick={() => handlePromptDeleteUser(u)}
                                title="Delete user"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="admin-quick-card">
                  <div className="quick-card-head">
                    <h3>Recent Organizations</h3>
                    <button className="quick-see-all" onClick={() => setActiveTab("organizations")}>
                      View All →
                    </button>
                  </div>
                  <div className="quick-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Company</th>
                          <th>Status</th>
                          <th>Verified</th>
                          <th>Jobs</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orgsList.slice(0, 5).map((o) => (
                          <tr key={o._id}>
                            <td>
                              <div className="user-primary-name-row">
                                <strong>{o.companyName || o.name}</strong>
                                {o.isVerified && <VerifiedBadge size={14} />}
                              </div>
                              <small>{o.email}</small>
                            </td>
                            <td>
                              {o.isLoggedIn ? (
                                <span className="status-pill status-online">🟢 Online</span>
                              ) : (
                                <span className="status-pill status-offline">⚪ Offline</span>
                              )}
                            </td>
                            <td>
                              <button
                                className={`admin-verify-btn ${o.isVerified ? "verified" : ""}`}
                                onClick={() => handleToggleVerify(o, "org")}
                                title={o.isVerified ? "Revoke CareerVerse Verified status" : "Award CareerVerse Verified badge"}
                              >
                                <CheckCircle size={12} />
                                <span>{o.isVerified ? "Verified" : "Verify"}</span>
                              </button>
                            </td>
                            <td>
                              <span className="count-badge">{o.jobsCount || 0} jobs</span>
                            </td>
                            <td>
                              <button
                                className="admin-email-btn"
                                style={{ marginRight: 6 }}
                                onClick={() => handleOpenCustomEmail(o)}
                                title="Send email to organization"
                              >
                                <Mail size={13} />
                              </button>
                              <button
                                className="admin-danger-btn"
                                onClick={() => handlePromptDeleteOrg(o)}
                                title="Delete organization"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CANDIDATES TAB */}
          {activeTab === "candidates" && (
            <div className="admin-section">
              <div className="admin-section-bar">
                <div className="admin-search-input-wrap">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search candidate name, email, headline, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                      <X size={14} />
                    </button>
                  )}
                </div>
                <span className="total-count-pill">Showing {filteredUsers.length} candidates</span>
              </div>

              <div className="admin-card-table">
                <table className="admin-table full-table">
                  <thead>
                    <tr>
                      <th>Candidate Details</th>
                      <th>Online Status</th>
                      <th>Uploaded Resume</th>
                      <th>Activity</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="admin-table-empty">
                          No candidates found matching your filter.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u._id}>
                          <td>
                            <div className="user-primary-info">
                              <div className="user-primary-name-row">
                                <strong>{u.name}</strong>
                                {u.isVerified && <VerifiedBadge size={16} />}
                              </div>
                              <span className="user-email-text">{u.email}</span>
                              <span className="user-headline-text">
                                {u.headline || "Candidate"} • {u.location || "India"}
                              </span>
                            </div>
                          </td>
                          <td>
                            {u.isLoggedIn ? (
                              <div className="status-block">
                                <span className="status-pill status-online">🟢 Currently Online</span>
                                {u.lastLogin && (
                                  <small className="last-login-text">
                                    Active: {new Date(u.lastLogin).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </small>
                                )}
                              </div>
                            ) : (
                              <div className="status-block">
                                <span className="status-pill status-offline">⚪ Logged Out</span>
                                {u.lastLogin ? (
                                  <small className="last-login-text">
                                    Last login: {new Date(u.lastLogin).toLocaleDateString()}
                                  </small>
                                ) : (
                                  <small className="last-login-text">Offline</small>
                                )}
                              </div>
                            )}
                          </td>
                          <td>
                            {u.resume ? (
                              <div className="resume-col-box">
                                <button
                                  className="admin-link-btn"
                                  onClick={() => handleOpenResume(u.resume)}
                                  title="Open PDF in new tab"
                                >
                                  <FileText size={14} /> View Resume PDF
                                </button>
                                <small className="file-sub-name">
                                  {u.resumeFileName || "candidate_resume.pdf"}
                                </small>
                              </div>
                            ) : (
                              <span className="no-resume-badge">No resume uploaded</span>
                            )}
                          </td>
                          <td>
                            <div className="activity-counts">
                              <span>
                                <strong>{u.postsCount || 0}</strong> Posts
                              </span>
                              <span>
                                <strong>{u.applicationsCount || 0}</strong> Applications
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="admin-action-row">
                              <button
                                className={`admin-action-btn verify-toggle-btn ${u.isVerified ? "is-verified" : ""}`}
                                onClick={() => handleToggleVerify(u, "user")}
                                title={u.isVerified ? "Revoke CareerVerse Verified status" : "Award CareerVerse Verified badge"}
                              >
                                <CheckCircle size={14} />
                                <span>{u.isVerified ? "Verified ★" : "Verify"}</span>
                              </button>
                              <button
                                className="admin-action-btn email-item-btn"
                                onClick={() => handleOpenCustomEmail(u)}
                                title="Send direct email to candidate"
                              >
                                <Mail size={14} /> Send Email
                              </button>
                              <button
                                className="admin-action-btn view-posts-btn"
                                onClick={() => handleOpenUserPosts(u)}
                                title="View candidate's community posts"
                              >
                                <MessageSquare size={14} /> View Posts ({u.postsCount || 0})
                              </button>
                              <button
                                className="admin-action-btn delete-item-btn"
                                onClick={() => handlePromptDeleteUser(u)}
                                title="Delete user"
                              >
                                <Trash2 size={14} /> Delete User
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ORGANIZATIONS TAB */}
          {activeTab === "organizations" && (
            <div className="admin-section">
              <div className="admin-section-bar">
                <div className="admin-search-input-wrap">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search organization name, email, industry, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                      <X size={14} />
                    </button>
                  )}
                </div>
                <span className="total-count-pill">Showing {filteredOrgs.length} organizations</span>
              </div>

              <div className="admin-card-table">
                <table className="admin-table full-table">
                  <thead>
                    <tr>
                      <th>Organization Details</th>
                      <th>Online Status</th>
                      <th>Company Size</th>
                      <th>Listed Jobs</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrgs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="admin-table-empty">
                          No organizations found matching your filter.
                        </td>
                      </tr>
                    ) : (
                      filteredOrgs.map((o) => (
                        <tr key={o._id}>
                          <td>
                            <div className="user-primary-info">
                              <div className="user-primary-name-row">
                                <strong>{o.companyName || o.name}</strong>
                                {o.isVerified && <VerifiedBadge size={16} />}
                              </div>
                              <span className="user-email-text">{o.email}</span>
                              <span className="user-headline-text">
                                {o.companyIndustry || "Technology"} • {o.location || "India"}
                              </span>
                              {o.companyWebsite && (
                                <a
                                  href={o.companyWebsite.startsWith("http") ? o.companyWebsite : `https://${o.companyWebsite}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="org-site-link"
                                >
                                  {o.companyWebsite.replace(/^https?:\/\//, "")}
                                </a>
                              )}
                            </div>
                          </td>
                          <td>
                            {o.isLoggedIn ? (
                              <div className="status-block">
                                <span className="status-pill status-online">🟢 Currently Online</span>
                                {o.lastLogin && (
                                  <small className="last-login-text">
                                    Active: {new Date(o.lastLogin).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </small>
                                )}
                              </div>
                            ) : (
                              <div className="status-block">
                                <span className="status-pill status-offline">⚪ Logged Out</span>
                                {o.lastLogin ? (
                                  <small className="last-login-text">
                                    Last login: {new Date(o.lastLogin).toLocaleDateString()}
                                  </small>
                                ) : (
                                  <small className="last-login-text">Offline</small>
                                )}
                              </div>
                            )}
                          </td>
                          <td>
                            <span className="size-badge-pill">
                              {o.companySize || "11-50 employees"}
                            </span>
                          </td>
                          <td>
                            <span className="count-badge">{o.jobsCount || 0} active jobs</span>
                          </td>
                          <td>
                            <div className="admin-action-row">
                              <button
                                className={`admin-action-btn verify-toggle-btn ${o.isVerified ? "is-verified" : ""}`}
                                onClick={() => handleToggleVerify(o, "org")}
                                title={o.isVerified ? "Revoke CareerVerse Verified status" : "Award CareerVerse Verified badge"}
                              >
                                <CheckCircle size={14} />
                                <span>{o.isVerified ? "Verified ★" : "Verify"}</span>
                              </button>
                              <button
                                className="admin-action-btn email-item-btn"
                                onClick={() => handleOpenCustomEmail(o)}
                                title="Send direct email to organization"
                              >
                                <Mail size={14} /> Send Email
                              </button>
                              <button
                                className="admin-action-btn view-posts-btn"
                                onClick={() => handleOpenOrgJobs(o)}
                                title="View jobs posted by this organization"
                              >
                                <Briefcase size={14} /> View Jobs ({o.jobsCount || 0})
                              </button>
                              <button
                                className="admin-action-btn delete-item-btn"
                                onClick={() => handlePromptDeleteOrg(o)}
                                title="Delete organization"
                              >
                                <Trash2 size={14} /> Delete Org
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* POSTS MODERATION TAB */}
          {activeTab === "posts" && (
            <div className="admin-section">
              <div className="admin-section-bar">
                <span className="total-count-pill">Recent Platform Posts ({postsList.length})</span>
              </div>

              <div className="admin-posts-grid">
                {postsList.length === 0 ? (
                  <p className="empty-text">No posts available on platform.</p>
                ) : (
                  postsList.map((post) => (
                    <div key={post._id} className="admin-post-item-card">
                      <div className="admin-post-item-header">
                        <div>
                          <strong>{post.author?.name || "Unknown User"}</strong>
                          <span className="admin-post-author-role">{post.author?.role || "student"}</span>
                          <small className="admin-post-date">
                            {post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}
                          </small>
                        </div>
                        <button
                          className="admin-danger-btn"
                          onClick={() => handlePromptDeletePost(post)}
                          title="Delete post"
                        >
                          <Trash2 size={14} /> Delete Post
                        </button>
                      </div>

                      {post.content && <p className="admin-post-content">{post.content}</p>}

                      {post.media && (
                        <div className="admin-post-media-preview">
                          {post.mediaType === "video" ? (
                            <video src={post.media.startsWith("http") ? post.media : `${BACKEND_URL}${post.media}`} controls style={{ maxWidth: "100%", maxHeight: 240 }} />
                          ) : post.mediaType === "document" ? (
                            <a href={post.media.startsWith("http") ? post.media : `${BACKEND_URL}${post.media}`} target="_blank" rel="noreferrer" className="admin-doc-preview-link">
                              <FileText size={16} /> View Attached Document
                            </a>
                          ) : (
                            <img src={post.media.startsWith("http") ? post.media : `${BACKEND_URL}${post.media}`} alt="Media attachment" style={{ maxWidth: "100%", maxHeight: 240, objectFit: "cover", borderRadius: 8 }} />
                          )}
                        </div>
                      )}

                      <div className="admin-post-footer">
                        <span>❤️ {post.likes ? post.likes.length : 0} Likes</span>
                        <span>💬 {post.comments ? post.comments.length : 0} Comments</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* JOBS MODERATION TAB */}
          {activeTab === "jobs" && (
            <div className="admin-section">
              <div className="admin-section-bar">
                <span className="total-count-pill">All Active Job Listings ({jobsList.length})</span>
              </div>

              <div className="admin-card-table">
                <table className="admin-table full-table">
                  <thead>
                    <tr>
                      <th>Job Title & Company</th>
                      <th>Type & Location</th>
                      <th>Salary</th>
                      <th>Applicants</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobsList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="admin-table-empty">No job postings found.</td>
                      </tr>
                    ) : (
                      jobsList.map((job) => (
                        <tr key={job._id || job.numericId}>
                          <td>
                            <strong>{job.title}</strong>
                            <br />
                            <small className="text-muted">{job.company || job.recruiter?.name || "Company"}</small>
                          </td>
                          <td>
                            <span className="status-pill status-offline">{job.type}</span>
                            <br />
                            <small>{job.location} ({job.workplaceType || "On-site"})</small>
                          </td>
                          <td>{job.salary || "Competitive"}</td>
                          <td>
                            <span className="count-badge">{job.applicantsCount || 0} applied</span>
                          </td>
                          <td>
                            <div className="admin-action-row">
                              <a
                                href={`/jobs/${job._id || job.numericId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="admin-action-btn view-posts-btn"
                                title="Open Job Page"
                              >
                                <ExternalLink size={14} /> Open
                              </a>
                              <button
                                className="admin-action-btn delete-item-btn"
                                onClick={() => handlePromptDeleteJob(job)}
                                title="Delete job posting"
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ----------------------------------------------------------- */}
      {/* MODAL: CANDIDATE POSTS REVIEW                               */}
      {/* ----------------------------------------------------------- */}
      {userPostsModal.open && (
        <div className="admin-modal-overlay" onClick={() => setUserPostsModal({ open: false, user: null, posts: [], loading: false })}>
          <div className="admin-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3>Posts by {userPostsModal.user?.name}</h3>
                <p>Review and moderate posts published by this candidate.</p>
              </div>
              <button
                className="admin-modal-close"
                onClick={() => setUserPostsModal({ open: false, user: null, posts: [], loading: false })}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              {userPostsModal.loading ? (
                <div className="modal-loading-box">
                  <Clock className="animate-spin" size={24} />
                  <p>Loading candidate posts...</p>
                </div>
              ) : userPostsModal.posts.length === 0 ? (
                <div className="modal-empty-box">
                  <MessageSquare size={36} color="#9ca3af" />
                  <h4>No posts found</h4>
                  <p>This candidate has not created any posts on CareerVerse yet.</p>
                </div>
              ) : (
                <div className="user-posts-scroll-list">
                  {userPostsModal.posts.map((post) => (
                    <div key={post._id} className="admin-modal-post-item">
                      <div className="modal-post-item-top">
                        <small>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Recent"}</small>
                        <button
                          className="admin-danger-btn"
                          onClick={() => handlePromptDeletePost(post)}
                          title="Delete this post"
                        >
                          <Trash2 size={14} /> Delete Post
                        </button>
                      </div>
                      {post.content && <p className="modal-post-text">{post.content}</p>}
                      {post.media && (
                        <div className="modal-post-media">
                          {post.mediaType === "video" ? (
                            <video src={post.media.startsWith("http") ? post.media : `${BACKEND_URL}${post.media}`} controls style={{ maxWidth: "100%", maxHeight: 200 }} />
                          ) : post.mediaType === "document" ? (
                            <a href={post.media.startsWith("http") ? post.media : `${BACKEND_URL}${post.media}`} target="_blank" rel="noreferrer" className="admin-doc-preview-link">
                              <FileText size={16} /> Download Attached Document
                            </a>
                          ) : (
                            <img src={post.media.startsWith("http") ? post.media : `${BACKEND_URL}${post.media}`} alt="Media attachment" style={{ maxWidth: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 6 }} />
                          )}
                        </div>
                      )}
                      <div className="modal-post-likes">
                        <span>❤️ {post.likes ? post.likes.length : 0} Likes</span>
                        <span>💬 {post.comments ? post.comments.length : 0} Comments</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* MODAL: ORGANIZATION JOBS REVIEW                             */}
      {/* ----------------------------------------------------------- */}
      {orgJobsModal.open && (
        <div className="admin-modal-overlay" onClick={() => setOrgJobsModal({ open: false, org: null, jobs: [], loading: false })}>
          <div className="admin-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3>Jobs by {orgJobsModal.org?.companyName || orgJobsModal.org?.name}</h3>
                <p>Manage and delete job listings posted by this organization.</p>
              </div>
              <button
                className="admin-modal-close"
                onClick={() => setOrgJobsModal({ open: false, org: null, jobs: [], loading: false })}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              {orgJobsModal.loading ? (
                <div className="modal-loading-box">
                  <Clock className="animate-spin" size={24} />
                  <p>Loading organization jobs...</p>
                </div>
              ) : orgJobsModal.jobs.length === 0 ? (
                <div className="modal-empty-box">
                  <Briefcase size={36} color="#9ca3af" />
                  <h4>No jobs listed</h4>
                  <p>This organization has not posted any active job listings yet.</p>
                </div>
              ) : (
                <div className="org-jobs-scroll-list">
                  {orgJobsModal.jobs.map((job) => (
                    <div key={job._id || job.numericId} className="admin-modal-job-item">
                      <div className="modal-job-info">
                        <strong>{job.title}</strong>
                        <p>{job.type} • {job.workplaceType || "On-site"} • {job.location}</p>
                        <span className="salary-pill">{job.salary || "Competitive"}</span>
                      </div>
                      <div className="modal-job-actions">
                        <a
                          href={`/jobs/${job._id || job.numericId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-action-btn view-posts-btn"
                          title="Open public job listing"
                        >
                          <ExternalLink size={14} /> View
                        </a>
                        <button
                          className="admin-danger-btn"
                          onClick={() => handlePromptDeleteJob(job)}
                          title="Delete this job"
                        >
                          <Trash2 size={14} /> Delete Job
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* MODAL: BROADCAST NOTIFICATION                               */}
      {/* ----------------------------------------------------------- */}
      {broadcastModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setBroadcastModalOpen(false)}>
          <div className="admin-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3>Broadcast Platform Announcement</h3>
                <p>Send a live system notification to every registered user on CareerVerse.</p>
              </div>
              <button className="admin-modal-close" onClick={() => setBroadcastModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="admin-modal-form">
              <div className="admin-form-group">
                <label>Announcement Title</label>
                <input
                  type="text"
                  placeholder="e.g. Scheduled System Maintenance / Welcome New Features"
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Message Content *</label>
                <textarea
                  rows={4}
                  placeholder="Type the message that will be delivered to every candidate and organization..."
                  value={broadcastForm.text}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, text: e.target.value })}
                  required
                />
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setBroadcastModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-primary-btn"
                  disabled={broadcasting}
                >
                  {broadcasting ? "Sending Broadcast..." : "Send Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* MODAL: MANDATORY REASON FOR DELETION                        */}
      {/* ----------------------------------------------------------- */}
      {deleteModal.open && (
        <div
          className="admin-modal-overlay"
          onClick={() =>
            !deleteModal.loading &&
            setDeleteModal({ open: false, type: "", item: null, title: "", recipientInfo: "", reason: "", loading: false })
          }
        >
          <div className="admin-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 style={{ display: "flex", alignItems: "center", gap: 8, color: "#dc2626" }}>
                  <AlertTriangle size={20} />
                  {deleteModal.title || "Confirm Deletion"}
                </h3>
                <p>{deleteModal.recipientInfo}</p>
              </div>
              <button
                className="admin-modal-close"
                disabled={deleteModal.loading}
                onClick={() =>
                  setDeleteModal({ open: false, type: "", item: null, title: "", recipientInfo: "", reason: "", loading: false })
                }
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmDeleteWithReason} className="admin-modal-form">
              <div className="admin-form-group">
                <label style={{ fontWeight: 600, color: "#1e293b" }}>
                  Reason for Deletion *{" "}
                  <span style={{ fontSize: 12, fontWeight: 400, color: "#64748b" }}>
                    (This message will be emailed directly to the account owner)
                  </span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Explain clearly why this item is being deleted (e.g. Terms of Service violation, fraudulent job listing, inappropriate content)..."
                  value={deleteModal.reason}
                  onChange={(e) => setDeleteModal({ ...deleteModal, reason: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn-outline"
                  disabled={deleteModal.loading}
                  onClick={() =>
                    setDeleteModal({ open: false, type: "", item: null, title: "", recipientInfo: "", reason: "", loading: false })
                  }
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-primary-btn"
                  style={{ background: "#dc2626" }}
                  disabled={deleteModal.loading || !deleteModal.reason.trim()}
                >
                  {deleteModal.loading ? "Deleting & Dispatching Email..." : "Confirm Deletion & Send Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* MODAL: SEND CUSTOM EMAIL DIRECTLY                           */}
      {/* ----------------------------------------------------------- */}
      {customEmailModal.open && (
        <div
          className="admin-modal-overlay"
          onClick={() =>
            !customEmailModal.loading &&
            setCustomEmailModal({ open: false, to: "", recipientName: "", subject: "", message: "", loading: false })
          }
        >
          <div className="admin-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Mail size={20} color="#2563eb" />
                  Send Direct Email
                </h3>
                <p>Send an official administrative email directly to a user or organization.</p>
              </div>
              <button
                className="admin-modal-close"
                disabled={customEmailModal.loading}
                onClick={() =>
                  setCustomEmailModal({ open: false, to: "", recipientName: "", subject: "", message: "", loading: false })
                }
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendCustomEmail} className="admin-modal-form">
              <div className="admin-form-group">
                <label>Recipient Email *</label>
                <input
                  type="email"
                  placeholder="recipient@example.com"
                  value={customEmailModal.to}
                  onChange={(e) => setCustomEmailModal({ ...customEmailModal, to: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Recipient Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe / TechNova Solutions"
                  value={customEmailModal.recipientName}
                  onChange={(e) => setCustomEmailModal({ ...customEmailModal, recipientName: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Email Subject *</label>
                <input
                  type="text"
                  placeholder="e.g. CareerVerse Platform Update / Important Notice"
                  value={customEmailModal.subject}
                  onChange={(e) => setCustomEmailModal({ ...customEmailModal, subject: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Email Message Content *</label>
                <textarea
                  rows={6}
                  placeholder="Type your message here. It will be sent formatted in CareerVerse's official semi-formal, modern email template..."
                  value={customEmailModal.message}
                  onChange={(e) => setCustomEmailModal({ ...customEmailModal, message: e.target.value })}
                  required
                />
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn-outline"
                  disabled={customEmailModal.loading}
                  onClick={() =>
                    setCustomEmailModal({ open: false, to: "", recipientName: "", subject: "", message: "", loading: false })
                  }
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-primary-btn"
                  disabled={customEmailModal.loading || !customEmailModal.to.trim() || !customEmailModal.subject.trim() || !customEmailModal.message.trim()}
                >
                  {customEmailModal.loading ? "Sending Email..." : "Send Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
