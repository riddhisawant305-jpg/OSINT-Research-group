import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Share2, Bookmark, BookmarkCheck, ExternalLink } from "lucide-react";
import { jobs } from "../data/dummyData";
import "./JobDetails.css";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const job = jobs.find((j) => j.id === Number(id));
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);

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

  return (
    <div className="cv-container job-detail-page">
      <button className="back-btn" onClick={() => navigate("/jobs")}>
        <ArrowLeft size={20} /> Back to jobs
      </button>

      <div className="card job-detail-head">
        <div className="job-logo big" style={{ background: job.logoColor }}>
          {job.logo}
        </div>
        <div className="job-detail-title">
          <h1>{job.title}</h1>
          <p>{job.company}</p>
          <div className="job-detail-meta">
            <span><MapPin size={14} /> {job.location}</span>
            <span className="job-type">{job.type}</span>
            <span>{job.salary}</span>
            <span className="posted">{job.posted}</span>
          </div>
        </div>
        <div className="job-detail-actions">
          <button className="icon-btn" onClick={() => setSaved(!saved)} aria-label="Save">
            {saved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
          </button>
          <button className="icon-btn" aria-label="Share"><Share2 size={20} /></button>
        </div>
      </div>

      <div className="job-detail-grid">
        <div className="job-detail-main">
          <div className="card job-detail-section">
            <h3>About the job</h3>
            <p>{job.description}</p>
          </div>

          <div className="card job-detail-section">
            <h3>Key skills</h3>
            <div className="job-skills">
              {job.skills.map((s) => (
                <span className="tag" key={s}>{s}</span>
              ))}
            </div>
          </div>

          <div className="card job-detail-section">
            <h3>What we offer</h3>
            <ul className="job-benefits">
              <li>Competitive salary & benefits</li>
              <li>Flexible working hours</li>
              <li>Learning & development budget</li>
              <li>Health insurance & wellness programs</li>
              <li>Remote-friendly culture</li>
            </ul>
          </div>
        </div>

        <aside className="job-detail-side">
          <div className="card apply-card">
            <button
              className={applied ? "applied-btn" : "btn-primary apply-btn"}
              onClick={() => setApplied(true)}
              disabled={applied}
            >
              {applied ? "✓ Applied" : "Apply Now"}
            </button>
            <p className="apply-note">
              <ExternalLink size={13} /> {job.applicants} people have applied
            </p>
          </div>

          <div className="card apply-card">
            <p className="apply-company">
              <strong>{job.company}</strong>
              <span>{job.location}</span>
              <span>{job.salary}</span>
            </p>
            <button className="btn-outline full">Follow company</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default JobDetails;
