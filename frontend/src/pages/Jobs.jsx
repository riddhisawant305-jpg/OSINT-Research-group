import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Bookmark, BookmarkCheck, Sparkles, ArrowRight } from "lucide-react";
import { jobs as fallbackJobs } from "../data/dummyData";
import { useAuth } from "../context/AuthContext";
import API from "../api/client";
import VerifiedBadge from "../component/VerifiedBadge";
import "./Jobs.css";

function Jobs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobList, setJobList] = useState(fallbackJobs);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [saved, setSaved] = useState({});
  const [matchResume, setMatchResume] = useState(false);

  useEffect(() => {
    if (user && (user.role === "organization" || user.role === "recruiter")) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    // Fetch live jobs from backend
    const fetchJobs = async () => {
      try {
        const res = await API.get("/jobs");
        if (res.data && res.data.data && res.data.data.length > 0) {
          setJobList(res.data.data);
        }
      } catch (err) {
        console.warn("Could not fetch jobs from backend:", err.message);
      }
    };

    // Fetch saved jobs from backend
    const fetchSavedJobs = async () => {
      try {
        const res = await API.get("/users/me/saved-jobs");
        if (res.data && res.data.data) {
          const map = {};
          res.data.data.forEach((j) => {
            if (j._id) map[j._id] = true;
            if (j.id) map[j.id] = true;
          });
          setSaved(map);
        }
      } catch (err) {
        // Ignore if unauthenticated
      }
    };

    fetchJobs();
    if (user) {
      fetchSavedJobs();
    }
  }, [user]);

  const toggleSave = async (job) => {
    if (!user) {
      alert("Please log in to save jobs to your profile.");
      navigate("/login");
      return;
    }

    const keyId = job._id || job.id;
    const isCurrentlySaved = !!(saved[job._id] || (job.id && saved[job.id]));

    // Optimistic state update
    setSaved((prev) => {
      const next = { ...prev };
      if (isCurrentlySaved) {
        if (job._id) delete next[job._id];
        if (job.id) delete next[job.id];
      } else {
        if (job._id) next[job._id] = true;
        if (job.id) next[job.id] = true;
      }
      return next;
    });

    try {
      if (isCurrentlySaved) {
        await API.delete(`/jobs/${keyId}/save`);
      } else {
        await API.post(`/jobs/${keyId}/save`);
      }
    } catch (err) {
      console.warn("Could not persist saved job:", err.message);
      // Revert if error
      setSaved((prev) => ({
        ...prev,
        [keyId]: isCurrentlySaved,
      }));
    }
  };

  const userSkills = (user?.skills || []).map((s) => String(s).toLowerCase().trim()).filter(Boolean);
  const userHeadline = (user?.headline || "").toLowerCase();
  const hasResumeData = userSkills.length > 0 || !!userHeadline || !!user?.resume;

  const filtered = jobList.filter((j) => {
    const matchQ =
      ((j.title || "") + (j.company || "") + (j.location || ""))
        .toLowerCase()
        .includes(query.toLowerCase());

    const isJobSaved = !!(saved[j._id] || (j.id && saved[j.id]));

    let matchT = true;
    if (type === "Saved") {
      matchT = isJobSaved;
    } else if (type !== "All") {
      matchT = j.type === type;
    }

    let matchR = true;
    if (matchResume) {
      if (!hasResumeData) {
        matchR = false;
      } else {
        const jobSkills = (j.skills || []).map((s) => String(s).toLowerCase().trim());
        const jobTitle = (j.title || "").toLowerCase();
        const jobDesc = (j.description || "").toLowerCase();

        const skillHit = userSkills.some(
          (skill) =>
            jobSkills.some((js) => js.includes(skill) || skill.includes(js)) ||
            jobTitle.includes(skill) ||
            jobDesc.includes(skill)
        );

        const headlineHit =
          userHeadline &&
          userHeadline
            .split(/\s+/)
            .filter((w) => w.length > 3)
            .some((w) => jobTitle.includes(w) || jobDesc.includes(w));

        matchR = skillHit || headlineHit;
      }
    }

    return matchQ && matchT && matchR;
  });

  return (
    <div className="jobs-page">
      <h1 className="section-title">Find your next opportunity</h1>

      <div className="jobs-toolbar card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 12, width: "100%", alignItems: "center" }}>
          <div className="job-search" style={{ flex: 1 }}>
            <Search size={18} />
            <input
              placeholder="Search by title, company, location"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="job-type-select"
          >
            <option value="All">All Jobs</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Remote">Remote</option>
            <option value="Saved">Saved</option>
          </select>
        </div>

        {/* AI Resume Filter Checkbox */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid var(--cv-border)", width: "100%" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              fontSize: 13.5,
              fontWeight: 600,
              color: matchResume ? "var(--cv-blue)" : "var(--cv-text)",
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              checked={matchResume}
              onChange={(e) => setMatchResume(e.target.checked)}
              style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--cv-blue)" }}
            />
            <Sparkles size={15} color="#7c3aed" />
            <span>Jobs as per my resume</span>
            <span
              style={{
                fontSize: 11,
                background: "rgba(124, 58, 237, 0.1)",
                color: "#7c3aed",
                padding: "2px 7px",
                borderRadius: 4,
                fontWeight: 700,
              }}
            >
              AI Matched
            </span>
          </label>

          {matchResume && userSkills.length > 0 && (
            <span style={{ fontSize: 12, color: "var(--cv-muted)" }}>
              Matching against {userSkills.length} skills from your profile
            </span>
          )}
        </div>
      </div>

      {/* Notice if user turned on resume filter without resume analyzed */}
      {matchResume && !hasResumeData && (
        <div
          className="card"
          style={{
            padding: "16px 20px",
            marginBottom: 16,
            background: "rgba(124, 58, 237, 0.05)",
            border: "1px solid rgba(124, 58, 237, 0.2)",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <strong style={{ color: "#7c3aed", display: "flex", alignItems: "center", gap: 6 }}>
              <Sparkles size={16} /> No AI Resume Analysis Found
            </strong>
            <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#4b5563" }}>
              Upload your resume PDF in your profile to let Gemini AI extract your skills and match jobs automatically.
            </p>
          </div>
          <button
            type="button"
            className="btn-primary"
            style={{ fontSize: 13, padding: "8px 14px", display: "flex", alignItems: "center", gap: 6 }}
            onClick={() => navigate("/profile")}
          >
            Optimize Profile with Resume <ArrowRight size={14} />
          </button>
        </div>
      )}

      <div className="job-list">
        {filtered.map((job) => {
          const keyId = job._id || job.id;
          const isJobSaved = !!(saved[job._id] || (job.id && saved[job.id]));
          const logoInitials = job.logo || (job.company ? job.company.slice(0, 2).toUpperCase() : "JB");

          return (
            <div
              key={keyId}
              className="card job-card-row"
              onClick={() => navigate(`/jobs/${keyId}`)}
            >
              <div className="job-logo" style={{ background: job.logoColor || "#2563eb" }}>
                {logoInitials}
              </div>
              <div className="job-info">
                <h3>{job.title}</h3>
                <p className="job-company" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>{job.company}</span>
                  {job.isVerified && <VerifiedBadge size={14} />}
                </p>
                <p className="job-meta">
                  <span><MapPin size={14} /> {job.location}</span>
                  <span className="job-type">{job.type}</span>
                  <span>{job.salary}</span>
                </p>
                <div className="job-skills">
                  {(job.skills || []).slice(0, 4).map((s) => (
                    <span className="tag" key={s}>{s}</span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                className="save-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSave(job);
                }}
                aria-label={isJobSaved ? "Unsave job" : "Save job"}
                title={isJobSaved ? "Job is saved" : "Save job"}
              >
                {isJobSaved ? <BookmarkCheck size={20} color="#2563eb" /> : <Bookmark size={20} />}
              </button>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="card empty-state">
            {type === "Saved"
              ? "You haven't saved any jobs yet. Click the bookmark icon on any job to save it here."
              : matchResume
              ? "No jobs currently match your analyzed resume skills. Try unchecking the resume filter or updating your skills in Edit Profile."
              : "No jobs match your search criteria."}
          </div>
        )}
      </div>
    </div>
  );
}

export default Jobs;
