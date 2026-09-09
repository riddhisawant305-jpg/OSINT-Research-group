import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Share2,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Briefcase,
  Building,
  CheckCircle,
  FileText,
  Mail,
  Phone,
  Globe,
  Award,
} from "lucide-react";
import { jobs as fallbackJobs } from "../data/dummyData";
import { useAuth } from "../context/AuthContext";
import API from "../api/client";
import "./JobDetails.css";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(() => fallbackJobs.find((j) => j.id === Number(id)) || null);
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const res = await API.get(`/jobs/${id}`);
        if (res.data && res.data.data) {
          setJob(res.data.data);
        }
      } catch (err) {
        console.warn("Could not fetch job by ID from backend:", err.message);
      }
    };

    const checkSavedAndApplied = async () => {
      try {
        const [savedRes, appRes] = await Promise.all([
          API.get("/users/me/saved-jobs"),
          API.get("/applications/me"),
        ]);

        if (savedRes.data && savedRes.data.data) {
          const isSaved = savedRes.data.data.some(
            (s) => String(s._id) === String(id) || String(s.id) === String(id)
          );
          setSaved(isSaved);
        }

        if (appRes.data && appRes.data.data) {
          const hasApplied = appRes.data.data.some(
            (a) =>
              String(a.jobId) === String(id) ||
              String(a.job?._id) === String(id) ||
              String(a.job?.id) === String(id)
          );
          setApplied(hasApplied);
        }
      } catch (e) {
        // Unauthenticated or offline
      }
    };

    fetchJobDetails();
    checkSavedAndApplied();
  }, [id]);

  const handleApply = async () => {
    if (applied || loading) return;
    setLoading(true);

    const targetJobId = job?._id || id;
    try {
      await API.post(`/jobs/${targetJobId}/apply`, {
        coverLetter: "Interested in this role via CareerVerse.",
        resume: user?.resume || "",
        resumeFileName: user?.resumeFileName || "",
        resumeFileType: user?.resumeFileType || "application/pdf",
      });
      setApplied(true);
      if (job) {
        setJob((prev) => ({
          ...prev,
          applicants: (prev.applicants || 0) + 1,
        }));
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setApplied(true);
      } else {
        console.warn("Application submission error:", err.message);
        setApplied(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async () => {
    const nextSaved = !saved;
    setSaved(nextSaved);

    const targetJobId = job?._id || id;
    try {
      if (nextSaved) {
        await API.post(`/jobs/${targetJobId}/save`);
      } else {
        await API.delete(`/jobs/${targetJobId}/save`);
      }
    } catch (e) {
      console.warn("Could not toggle saved job:", e.message);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareFeedback(true);
    setTimeout(() => setShareFeedback(false), 2500);
  };

  if (!job) {
    return (
      <div className="cv-container">
        <div className="card empty-state">
          <p>Job not found.</p>
          <button className="btn-primary" style={{ marginTop: 14 }} onClick={() => navigate("/jobs")}>
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const logoInitials = job.logo || (job.company ? job.company.slice(0, 2).toUpperCase() : "CV");
  const recruiterId = job.recruiter?._id || job.recruiter;

  const responsibilitiesList = Array.isArray(job.responsibilities)
    ? job.responsibilities
    : typeof job.responsibilities === "string"
    ? job.responsibilities.split("\n").filter(Boolean)
    : [];

  const requirementsList = Array.isArray(job.requirements)
    ? job.requirements
    : typeof job.requirements === "string"
    ? job.requirements.split("\n").filter(Boolean)
    : [];

  const hr = job.hrDetails;
  const org = job.organizationDetails;

  return (
    <div className="cv-container job-detail-page">
      <button className="back-btn" onClick={() => navigate("/jobs")}>
        <ArrowLeft size={20} /> Back to jobs
      </button>

      {/* Header Card */}
      <div className="card job-detail-head">
        <div className="job-logo big" style={{ background: job.logoColor || "#2563eb" }}>
          {logoInitials}
        </div>
        <div className="job-detail-title">
          <h1>{job.title}</h1>
          <p
            className={`job-company-link ${recruiterId ? "clickable" : ""}`}
            onClick={() => recruiterId && navigate(`/profile/${recruiterId}`)}
            title={recruiterId ? "View Organization Profile" : undefined}
          >
            <Building size={15} /> {job.company}
            {recruiterId && <span className="view-org-badge">View Profile</span>}
          </p>

          <div className="job-detail-meta">
            <span><MapPin size={14} /> {job.location}</span>
            <span className="job-type-pill">{job.type}</span>
            {job.workplaceType && <span className="job-workplace-pill">{job.workplaceType}</span>}
            {job.experienceLevel && <span className="job-level-pill"><Award size={12} /> {job.experienceLevel}</span>}
            <span>💰 {job.salary}</span>
            <span className="posted">{job.posted || "Recently"}</span>
          </div>
        </div>

        <div className="job-detail-actions">
          <button className="icon-btn" onClick={toggleSave} aria-label="Save" title="Save Job">
            {saved ? <BookmarkCheck size={20} color="#2563eb" /> : <Bookmark size={20} />}
          </button>
          <button className="icon-btn" onClick={handleShare} aria-label="Share" title="Copy Link">
            <Share2 size={20} />
          </button>
          {shareFeedback && <span className="copied-toast">Link Copied!</span>}
        </div>
      </div>

      <div className="job-detail-grid">
        <div className="job-detail-main">
          {/* Summary / Description */}
          <div className="card job-detail-section">
            <h3>Overview</h3>
            <p>{job.description}</p>
          </div>

          {/* About the Role */}
          {job.aboutRole && (
            <div className="card job-detail-section">
              <h3>About the Role</h3>
              <p>{job.aboutRole}</p>
            </div>
          )}

          {/* Responsibilities */}
          {responsibilitiesList.length > 0 && (
            <div className="card job-detail-section">
              <h3>Key Responsibilities</h3>
              <ul className="job-bullets">
                {responsibilitiesList.map((resp, i) => (
                  <li key={i}>{resp}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {requirementsList.length > 0 && (
            <div className="card job-detail-section">
              <h3>Requirements & Qualifications</h3>
              <ul className="job-bullets">
                {requirementsList.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="card job-detail-section">
              <h3>Key Skills Required</h3>
              <div className="job-skills">
                {job.skills.map((s) => (
                  <span className="tag" key={s}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* HR & Hiring Contact */}
          {hr && (hr.name || hr.email) && (
            <div className="card job-detail-section">
              <h3>Hiring Team & Contact</h3>
              <div className="job-hr-box">
                {hr.name && (
                  <div className="hr-item">
                    <strong>Hiring Lead:</strong> <span>{hr.name}</span>
                  </div>
                )}
                {hr.email && (
                  <div className="hr-item">
                    <Mail size={14} color="var(--cv-muted)" />
                    <a href={`mailto:${hr.email}`} className="hr-link">{hr.email}</a>
                  </div>
                )}
                {hr.phone && (
                  <div className="hr-item">
                    <Phone size={14} color="var(--cv-muted)" />
                    <span>{hr.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* What We Offer */}
          <div className="card job-detail-section">
            <h3>What We Offer</h3>
            <ul className="job-benefits">
              <li>Competitive salary & performance bonuses</li>
              <li>Flexible working hours and work-life balance</li>
              <li>Learning & professional development allowance</li>
              <li>Comprehensive health insurance & wellness programs</li>
              <li>Inclusive and growth-focused workplace culture</li>
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="job-detail-side">
          {/* Apply Card */}
          <div className="card apply-card">
            {/* Auto-attach resume status banner */}
            <div className={`apply-resume-banner ${user?.resume ? "has-resume" : "no-resume"}`}>
              <div className="resume-banner-top">
                <FileText size={16} color={user?.resume ? "#059669" : "#d97706"} />
                <strong>
                  {user?.resume ? "Saved Resume Auto-Attached" : "No Resume Saved in Profile"}
                </strong>
              </div>
              <p>
                {user?.resume
                  ? `Your saved resume (${user.resumeFileName || "Candidate_Resume.pdf"}) will be automatically submitted with your application.`
                  : "Upload your resume in Profile via AI Resume Optimizer to enable 1-click auto-attach."}
              </p>
            </div>

            <button
              className={applied ? "applied-btn" : "btn-primary apply-btn"}
              onClick={handleApply}
              disabled={applied || loading}
            >
              {applied ? "✓ Applied with Resume" : loading ? "Submitting Application..." : "Apply Now"}
            </button>
            <p className="apply-note">
              <ExternalLink size={13} /> {job.applicants || 0} candidates have applied
            </p>
          </div>

          {/* Company Sidebar Card */}
          <div className="card apply-card">
            <p className="apply-company">
              <strong>{job.company}</strong>
              <span><MapPin size={13} /> {job.location}</span>
              {org?.industry && <span>{org.industry}</span>}
              {org?.website && (
                <a
                  href={org.website.startsWith("http") ? org.website : `https://${org.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="company-website-link"
                >
                  <Globe size={13} /> {org.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </p>
            {recruiterId && (
              <button
                className="btn-outline full"
                onClick={() => navigate(`/profile/${recruiterId}`)}
              >
                View Company Profile
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default JobDetails;

