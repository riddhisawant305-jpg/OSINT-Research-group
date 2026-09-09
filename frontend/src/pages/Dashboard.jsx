import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Eye,
  Search,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Briefcase,
  Plus,
  Users,
  CheckCircle,
  ExternalLink,
  Building,
  Globe,
  Mail,
  Phone,
  FileText,
  Download,
  X,
  Clock,
  Award,
} from "lucide-react";
import {
  careerStats as fallbackStats,
  skillProgress as fallbackSkills,
} from "../data/dummyData";
import { useAuth } from "../context/AuthContext";
import API from "../api/client";
import Avatar from "../component/Avatar";
import "./Dashboard.css";

const activity = [
  { month: "Jan", views: 120, searches: 90 },
  { month: "Feb", views: 150, searches: 110 },
  { month: "Mar", views: 180, searches: 130 },
  { month: "Apr", views: 210, searches: 160 },
  { month: "May", views: 240, searches: 180 },
  { month: "Jun", views: 245, searches: 190 },
];

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isOrgOrRecruiter =
    user?.role === "organization" || user?.role === "recruiter";

  // Candidate state
  const [statsData, setStatsData] = useState(fallbackStats);
  const [skillsData, setSkillsData] = useState(fallbackSkills);

  // Organization state
  const [recruiterStats, setRecruiterStats] = useState({
    jobsPostedCount: 0,
    totalApplicationsCount: 0,
    shortlistedCount: 0,
    acceptedCount: 0,
  });
  const [postedJobs, setPostedJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [postJobModalOpen, setPostJobModalOpen] = useState(false);
  const [postJobSubmitting, setPostJobSubmitting] = useState(false);
  const [postJobError, setPostJobError] = useState("");

  const [applicantsModalJob, setApplicantsModalJob] = useState(null);
  const [jobApplications, setJobApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [updatingAppId, setUpdatingAppId] = useState(null);

  // Job creation form
  const [newJobForm, setNewJobForm] = useState({
    title: "",
    workplaceType: "On-site",
    type: "Full-time",
    location: user?.location || "",
    experienceLevel: "Mid-Level",
    salary: "",
    description: "",
    aboutRole: "",
    responsibilities: "",
    requirements: "",
    skills: "",
    hrName: user?.hrDetails?.name || user?.name || "",
    hrEmail: user?.hrDetails?.email || user?.email || "",
    hrPhone: user?.hrDetails?.phone || user?.phone || "",
    orgAbout: user?.organizationDetails?.about || user?.about || "",
  });

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await API.get("/users/me/dashboard");
      if (res.data && res.data.data) {
        const d = res.data.data;
        if (d.careerStats) setStatsData(d.careerStats);
        if (d.skillProgress && d.skillProgress.length > 0)
          setSkillsData(d.skillProgress);

        if (d.recruiterStats) setRecruiterStats(d.recruiterStats);
        if (d.postedJobs) setPostedJobs(d.postedJobs);
      }
    } catch (err) {
      console.warn("Could not load backend dashboard data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user]);

  // Handle post new job
  const handleCreateJob = async (e) => {
    e.preventDefault();
    setPostJobError("");

    if (!newJobForm.title.trim() || !newJobForm.location.trim() || !newJobForm.description.trim()) {
      setPostJobError("Job Title, Location, and Description are required.");
      return;
    }

    setPostJobSubmitting(true);
    try {
      const payload = {
        title: newJobForm.title.trim(),
        company: user?.companyName || user?.name || "Organization",
        workplaceType: newJobForm.workplaceType,
        type: newJobForm.type,
        location: newJobForm.location.trim(),
        experienceLevel: newJobForm.experienceLevel,
        salary: newJobForm.salary.trim() || "Competitive",
        description: newJobForm.description.trim(),
        aboutRole: newJobForm.aboutRole.trim(),
        responsibilities: newJobForm.responsibilities
          ? newJobForm.responsibilities.split("\n").filter(Boolean)
          : [],
        requirements: newJobForm.requirements
          ? newJobForm.requirements.split("\n").filter(Boolean)
          : [],
        skills: newJobForm.skills
          ? newJobForm.skills.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        hrDetails: {
          name: newJobForm.hrName.trim() || user?.name || "",
          email: newJobForm.hrEmail.trim() || user?.email || "",
          phone: newJobForm.hrPhone.trim() || "",
        },
        organizationDetails: {
          name: user?.companyName || user?.name || "Organization",
          website: user?.companyWebsite || "",
          industry: user?.companyIndustry || "",
          about: newJobForm.orgAbout.trim() || user?.about || "",
        },
      };

      await API.post("/jobs", payload);
      setPostJobModalOpen(false);
      setNewJobForm({
        title: "",
        workplaceType: "On-site",
        type: "Full-time",
        location: user?.location || "",
        experienceLevel: "Mid-Level",
        salary: "",
        description: "",
        aboutRole: "",
        responsibilities: "",
        requirements: "",
        skills: "",
        hrName: user?.hrDetails?.name || user?.name || "",
        hrEmail: user?.hrDetails?.email || user?.email || "",
        hrPhone: user?.hrDetails?.phone || user?.phone || "",
        orgAbout: user?.organizationDetails?.about || user?.about || "",
      });
      loadDashboard();
    } catch (err) {
      setPostJobError(
        err.response?.data?.message || "Failed to post job. Please try again."
      );
    } finally {
      setPostJobSubmitting(false);
    }
  };

  // Open applicants modal
  const handleOpenApplicants = async (job) => {
    setApplicantsModalJob(job);
    setLoadingApplications(true);
    try {
      const res = await API.get(`/jobs/${job._id}/applications`);
      if (res.data && res.data.data) {
        setJobApplications(res.data.data);
      } else {
        setJobApplications([]);
      }
    } catch (err) {
      console.warn("Could not load applications:", err.message);
      setJobApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  };

  // Update applicant status
  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingAppId(appId);
    try {
      await API.put(`/applications/${appId}/status`, { status: newStatus });
      setJobApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
      );
      loadDashboard();
    } catch (err) {
      console.warn("Could not update status:", err.message);
    } finally {
      setUpdatingAppId(null);
    }
  };

  // Helper to download applicant resume
  const handleDownloadResume = (resumeData, applicantName, filename) => {
    if (!resumeData) return;
    const downloadName =
      filename || `${applicantName ? applicantName.replace(/\s+/g, "_") : "Applicant"}_Resume.pdf`;
    const link = document.createElement("a");
    link.href = resumeData;
    link.download = downloadName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ----------------------------------------------------
  // ORGANIZATION / RECRUITER DASHBOARD
  // ----------------------------------------------------
  if (isOrgOrRecruiter) {
    const companyTitle =
      user?.companyName || user?.name || "Hiring Organization";
    const orgStats = [
      {
        label: "Jobs Listed",
        value: recruiterStats?.jobsPostedCount || postedJobs.length || 0,
        Icon: Briefcase,
        trend: "Active",
      },
      {
        label: "Applications Received",
        value: recruiterStats?.totalApplicationsCount || 0,
        Icon: Users,
        trend: "Total",
      },
      {
        label: "Shortlisted",
        value: recruiterStats?.shortlistedCount || 0,
        Icon: CheckCircle,
        trend: "Candidates",
      },
      {
        label: "Offers / Accepted",
        value: recruiterStats?.acceptedCount || 0,
        Icon: Award,
        trend: "Hired",
      },
    ];

    return (
      <div className="dashboard-page org-dashboard-page">
        {/* Header */}
        <div className="dash-head">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 className="section-title" style={{ margin: 0 }}>
                {companyTitle}
              </h1>
              <span className="org-badge-pill">
                <Building size={13} /> Organization
              </span>
            </div>
            <p className="dash-subtitle">
              Manage your job openings, track candidate applications, and review resumes.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              className="btn-outline dash-btn"
              onClick={() => navigate(`/profile/${user?._id}`)}
              title="View your public organization page"
            >
              <ExternalLink size={16} /> Public Profile
            </button>
            <button
              className="btn-primary dash-btn"
              onClick={() => setPostJobModalOpen(true)}
            >
              <Plus size={16} /> Post New Job
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="stat-grid">
          {orgStats.map(({ label, value, Icon, trend }) => (
            <div key={label} className="card stat-card">
              <div className="stat-top">
                <span className="stat-icon">
                  <Icon size={20} />
                </span>
                <span className="stat-trend">{trend}</span>
              </div>
              <strong>{value}</strong>
              <span className="stat-label">{label}</span>
            </div>
          ))}
        </div>

        {/* Company & HR Info Card */}
        <div className="card org-info-summary-card">
          <div className="org-info-summary-head">
            <h3>
              <Building size={18} color="var(--cv-blue)" /> Company & Talent Contact
            </h3>
            <button
              className="btn-outline"
              style={{ fontSize: 13, padding: "5px 12px" }}
              onClick={() => navigate("/edit-profile")}
            >
              Edit Details
            </button>
          </div>
          <div className="org-info-summary-grid">
            <div>
              <span className="summary-label">Industry</span>
              <strong>{user?.companyIndustry || user?.organizationDetails?.industry || "Technology"}</strong>
            </div>
            <div>
              <span className="summary-label">Website</span>
              {user?.companyWebsite ? (
                <a
                  href={
                    user.companyWebsite.startsWith("http")
                      ? user.companyWebsite
                      : `https://${user.companyWebsite}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="summary-link"
                >
                  <Globe size={13} /> {user.companyWebsite.replace(/^https?:\/\//, "")}
                </a>
              ) : (
                <span>Not specified</span>
              )}
            </div>
            <div>
              <span className="summary-label">Location</span>
              <strong>{user?.location || "India"}</strong>
            </div>
            <div>
              <span className="summary-label">Company Size</span>
              <strong>{user?.companySize || "10-50 employees"}</strong>
            </div>
            <div>
              <span className="summary-label">HR / Contact Person</span>
              <strong>{user?.hrDetails?.name || user?.name || "Hiring Manager"}</strong>
            </div>
            <div>
              <span className="summary-label">HR Contact Email</span>
              <a href={`mailto:${user?.hrDetails?.email || user?.email}`} className="summary-link">
                <Mail size={13} /> {user?.hrDetails?.email || user?.email}
              </a>
            </div>
          </div>
        </div>

        {/* Listed Jobs Section */}
        <div className="card org-jobs-manager-card">
          <div className="org-jobs-manager-header">
            <div>
              <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <Briefcase size={18} color="var(--cv-blue)" /> Your Job Listings
              </h3>
              <p style={{ color: "var(--cv-muted)", fontSize: 13, margin: "4px 0 0 0" }}>
                Active jobs posted by your organization and their submitted applications.
              </p>
            </div>
            <button
              className="btn-primary"
              style={{ fontSize: 13, padding: "8px 14px" }}
              onClick={() => setPostJobModalOpen(true)}
            >
              <Plus size={15} /> Add Another Job
            </button>
          </div>

          {postedJobs.length === 0 ? (
            <div className="empty-jobs-banner">
              <Briefcase size={36} color="#9ca3af" />
              <h4>No jobs listed yet</h4>
              <p>Post your first job opening to start receiving qualified applicant resumes.</p>
              <button
                className="btn-primary"
                style={{ marginTop: 12 }}
                onClick={() => setPostJobModalOpen(true)}
              >
                <Plus size={16} /> Post a Job Opening
              </button>
            </div>
          ) : (
            <div className="posted-jobs-table-wrap">
              <table className="posted-jobs-table">
                <thead>
                  <tr>
                    <th>Job Title & Role</th>
                    <th>Type & Workplace</th>
                    <th>Location</th>
                    <th>Salary</th>
                    <th>Applicants</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {postedJobs.map((job) => (
                    <tr key={job._id || job.id}>
                      <td>
                        <div className="job-table-title-box">
                          <strong>{job.title}</strong>
                          <small>
                            Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "recently"}
                          </small>
                        </div>
                      </td>
                      <td>
                        <span className="job-type-pill">{job.type}</span>
                        <span className="job-workplace-pill" style={{ marginLeft: 6 }}>
                          {job.workplaceType || "On-site"}
                        </span>
                      </td>
                      <td>{job.location}</td>
                      <td>{job.salary || "Competitive"}</td>
                      <td>
                        <span className="applicant-count-pill">
                          <Users size={12} /> {job.applicantsCount || 0}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <button
                            className="btn-primary table-btn"
                            onClick={() => handleOpenApplicants(job)}
                          >
                            Review Applications ({job.applicantsCount || 0})
                          </button>
                          <a
                            href={`/jobs/${job._id || job.numericId || job.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-outline table-btn icon-only"
                            title="View Public Job Page"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* -------------------------------------------------- */}
        {/* POST JOB MODAL                                     */}
        {/* -------------------------------------------------- */}
        {postJobModalOpen && (
          <div className="cv-modal-overlay" onClick={() => setPostJobModalOpen(false)}>
            <div className="cv-modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="cv-modal-header">
                <div>
                  <h2 style={{ margin: 0, fontSize: 19 }}>List a New Job Opening</h2>
                  <p style={{ margin: "4px 0 0 0", color: "var(--cv-muted)", fontSize: 13 }}>
                    Share role details, requirements, responsibilities, and hiring info.
                  </p>
                </div>
                <button
                  type="button"
                  className="cv-modal-close"
                  onClick={() => setPostJobModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              {postJobError && <div className="dash-alert-error">{postJobError}</div>}

              <form onSubmit={handleCreateJob} className="post-job-form">
                <div className="form-group-row">
                  <div className="form-group" style={{ flex: 2 }}>
                    <label>Job Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Frontend Engineer"
                      value={newJobForm.title}
                      onChange={(e) =>
                        setNewJobForm({ ...newJobForm, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Workplace Type</label>
                    <select
                      value={newJobForm.workplaceType}
                      onChange={(e) =>
                        setNewJobForm({
                          ...newJobForm,
                          workplaceType: e.target.value,
                        })
                      }
                    >
                      <option value="On-site">On-site</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Employment Type</label>
                    <select
                      value={newJobForm.type}
                      onChange={(e) =>
                        setNewJobForm({ ...newJobForm, type: e.target.value })
                      }
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Experience Level</label>
                    <select
                      value={newJobForm.experienceLevel}
                      onChange={(e) =>
                        setNewJobForm({
                          ...newJobForm,
                          experienceLevel: e.target.value,
                        })
                      }
                    >
                      <option value="Entry-Level">Entry-Level</option>
                      <option value="Mid-Level">Mid-Level</option>
                      <option value="Senior">Senior</option>
                      <option value="Lead">Lead</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Location *</label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai, India or Remote"
                      value={newJobForm.location}
                      onChange={(e) =>
                        setNewJobForm({ ...newJobForm, location: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Salary / Compensation Range</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹15 - 22 LPA or $90k - $120k / yr"
                    value={newJobForm.salary}
                    onChange={(e) =>
                      setNewJobForm({ ...newJobForm, salary: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Role Summary & Overview *</label>
                  <textarea
                    rows={3}
                    placeholder="Provide a compelling overview of what the candidate will be doing..."
                    value={newJobForm.description}
                    onChange={(e) =>
                      setNewJobForm({ ...newJobForm, description: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>About the Role (Details & Mission)</label>
                  <textarea
                    rows={3}
                    placeholder="Explain the day-to-day context, team goals, and technology stack..."
                    value={newJobForm.aboutRole}
                    onChange={(e) =>
                      setNewJobForm({ ...newJobForm, aboutRole: e.target.value })
                    }
                  />
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Key Responsibilities (One per line)</label>
                    <textarea
                      rows={4}
                      placeholder="• Architect reliable React components&#10;• Collaborate with backend engineers&#10;• Ensure unit testing coverage"
                      value={newJobForm.responsibilities}
                      onChange={(e) =>
                        setNewJobForm({
                          ...newJobForm,
                          responsibilities: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Requirements & Qualifications (One per line)</label>
                    <textarea
                      rows={4}
                      placeholder="• 3+ years experience with modern JavaScript&#10;• Strong understanding of REST APIs&#10;• Good communication skills"
                      value={newJobForm.requirements}
                      onChange={(e) =>
                        setNewJobForm({
                          ...newJobForm,
                          requirements: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Required Skills (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="React, TypeScript, Redux, Node.js, REST APIs"
                    value={newJobForm.skills}
                    onChange={(e) =>
                      setNewJobForm({ ...newJobForm, skills: e.target.value })
                    }
                  />
                </div>

                <div className="form-divider-title">HR & Hiring Team Contact</div>
                <div className="form-group-row">
                  <div className="form-group">
                    <label>HR Contact Name</label>
                    <input
                      type="text"
                      value={newJobForm.hrName}
                      onChange={(e) =>
                        setNewJobForm({ ...newJobForm, hrName: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>HR Contact Email</label>
                    <input
                      type="email"
                      value={newJobForm.hrEmail}
                      onChange={(e) =>
                        setNewJobForm({ ...newJobForm, hrEmail: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>HR Contact Phone</label>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={newJobForm.hrPhone}
                      onChange={(e) =>
                        setNewJobForm({ ...newJobForm, hrPhone: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="cv-modal-actions">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setPostJobModalOpen(false)}
                    disabled={postJobSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={postJobSubmitting}
                  >
                    {postJobSubmitting ? "Publishing Job..." : "Publish Job Opening"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* -------------------------------------------------- */}
        {/* APPLICANTS REVIEW MODAL                            */}
        {/* -------------------------------------------------- */}
        {applicantsModalJob && (
          <div
            className="cv-modal-overlay"
            onClick={() => setApplicantsModalJob(null)}
          >
            <div
              className="cv-modal-dialog wide-dialog"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cv-modal-header">
                <div>
                  <h2 style={{ margin: 0, fontSize: 19 }}>
                    Applications for: {applicantsModalJob.title}
                  </h2>
                  <p style={{ margin: "4px 0 0 0", color: "var(--cv-muted)", fontSize: 13 }}>
                    Review candidate details, view submitted resumes, and update recruitment status.
                  </p>
                </div>
                <button
                  type="button"
                  className="cv-modal-close"
                  onClick={() => setApplicantsModalJob(null)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="applicants-modal-content">
                {loadingApplications ? (
                  <div className="dash-loading-box">
                    <Clock className="animate-spin" size={24} color="var(--cv-blue)" />
                    <p>Loading candidate applications...</p>
                  </div>
                ) : jobApplications.length === 0 ? (
                  <div className="dash-empty-applicants">
                    <Users size={40} color="#9ca3af" />
                    <h4>No applications yet</h4>
                    <p>When candidates apply for this job, their profiles and saved resumes will appear here.</p>
                  </div>
                ) : (
                  <div className="applicants-list">
                    {jobApplications.map((app) => {
                      const cand = app.applicant || {};
                      const hasResume = !!(app.resume || cand.resume);
                      const resumeData = app.resume || cand.resume;
                      const resumeName =
                        app.resumeFileName ||
                        cand.resumeFileName ||
                        `${cand.name ? cand.name.replace(/\s+/g, "_") : "Candidate"}_Resume.pdf`;

                      return (
                        <div key={app._id} className="applicant-review-card">
                          <div className="applicant-card-top">
                            <div className="applicant-user-info">
                              <Avatar user={cand} size={48} />
                              <div>
                                <h4>{cand.name || "Anonymous Candidate"}</h4>
                                <p className="applicant-headline">
                                  {cand.headline || "CareerVerse Candidate"}
                                </p>
                                <span className="applicant-email">
                                  <Mail size={12} /> {cand.email}
                                </span>
                              </div>
                            </div>

                            <div className="applicant-status-control">
                              <label>Application Status:</label>
                              <select
                                value={app.status}
                                onChange={(e) =>
                                  handleStatusChange(app._id, e.target.value)
                                }
                                disabled={updatingAppId === app._id}
                                className={`status-select ${app.status.toLowerCase().replace(/\s+/g, "-")}`}
                              >
                                <option value="Applied">Applied</option>
                                <option value="Under Review">Under Review</option>
                                <option value="Shortlisted">Shortlisted</option>
                                <option value="Accepted">Accepted</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                            </div>
                          </div>

                          {cand.skills && cand.skills.length > 0 && (
                            <div className="applicant-skills">
                              {cand.skills.slice(0, 5).map((s) => (
                                <span key={s} className="tag">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}

                          {app.coverLetter && (
                            <div className="applicant-cover-letter">
                              <strong>Candidate Note:</strong> {app.coverLetter}
                            </div>
                          )}

                          <div className="applicant-card-actions">
                            <div className="applicant-resume-status">
                              {hasResume ? (
                                <button
                                  type="button"
                                  className="btn-outline resume-view-btn"
                                  onClick={() =>
                                    handleDownloadResume(
                                      resumeData,
                                      cand.name,
                                      resumeName
                                    )
                                  }
                                >
                                  <FileText size={15} color="#dc2626" />
                                  <span>Download Resume ({resumeName})</span>
                                  <Download size={14} />
                                </button>
                              ) : (
                                <span className="no-resume-badge">
                                  No resume attached
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              className="btn-outline profile-link-btn"
                              onClick={() => navigate(`/profile/${cand._id}`)}
                            >
                              <ExternalLink size={14} /> View Candidate Profile
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // STUDENT / CANDIDATE DASHBOARD
  // ----------------------------------------------------
  const stats = [
    {
      label: "Profile Views",
      value: statsData.profileViews,
      Icon: Eye,
      trend: "+12%",
    },
    {
      label: "Search Appearances",
      value: statsData.searchAppearances,
      Icon: Search,
      trend: "+8%",
    },
    {
      label: "Application Views",
      value: statsData.applicationViews,
      Icon: TrendingUp,
      trend: "+20%",
    },
    {
      label: "Interview Invites",
      value: statsData.interviewInvites,
      Icon: MessageSquare,
      trend: "+2",
    },
  ];

  const profileStrength =
    typeof statsData.profileStrength === "number"
      ? statsData.profileStrength
      : 75;

  return (
    <div className="dashboard-page">
      <div className="dash-head">
        <div>
          <h1 className="section-title">Career Dashboard</h1>
          <p className="dash-subtitle">
            Track your professional growth at a glance.
          </p>
        </div>
        <button
          className="btn-primary dash-btn"
          onClick={loadDashboard}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"} <ArrowRight size={16} />
        </button>
      </div>

      <div className="stat-grid">
        {stats.map(({ label, value, Icon, trend }) => (
          <div key={label} className="card stat-card">
            <div className="stat-top">
              <span className="stat-icon">
                <Icon size={20} />
              </span>
              <span className="stat-trend">{trend}</span>
            </div>
            <strong>{value}</strong>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <div className="card dash-chart">
          <h3>Profile Activity</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activity}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="views" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="searches" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card dash-chart">
          <h3>Skill Proficiency</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={skillsData}
                margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="level"
                  stroke="#7c3aed"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card dash-strength">
        <div>
          <h3>Profile Strength</h3>
          <p className="dash-subtitle">Boost it to get more recruiter attention.</p>
        </div>
        <div
          className="strength-ring"
          style={{
            background: `conic-gradient(#7c3aed ${profileStrength}%, #e5e7eb 0)`,
          }}
        >
          <div className="strength-inner">
            <strong>{profileStrength}%</strong>
          </div>
        </div>
        <button
          className="btn-outline"
          onClick={() => navigate("/edit-profile")}
        >
          Improve Profile
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
