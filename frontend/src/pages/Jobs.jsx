import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Bookmark, BookmarkCheck } from "lucide-react";
import { jobs as fallbackJobs } from "../data/dummyData";
import API from "../api/client";
import "./Jobs.css";

function Jobs() {
  const navigate = useNavigate();
  const [jobList, setJobList] = useState(fallbackJobs);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [saved, setSaved] = useState({});

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
            map[j._id] = true;
            if (j.id) map[j.id] = true;
          });
          setSaved(map);
        }
      } catch (err) {
        // Ignore if unauthenticated
      }
    };

    fetchJobs();
    fetchSavedJobs();
  }, []);

  const filtered = jobList.filter((j) => {
    const matchQ =
      ((j.title || "") + (j.company || "") + (j.location || ""))
        .toLowerCase()
        .includes(query.toLowerCase());
    const matchT = type === "All" || j.type === type;
    return matchQ && matchT;
  });

  const toggleSave = async (id, mongoId) => {
    const targetId = mongoId || id;
    const isSaved = !!saved[targetId] || !!saved[id];
    setSaved((s) => ({ ...s, [targetId]: !isSaved, [id]: !isSaved }));

    try {
      if (isSaved) {
        await API.delete(`/jobs/${targetId}/save`);
      } else {
        await API.post(`/jobs/${targetId}/save`);
      }
    } catch (err) {
      console.warn("Could not persist saved job:", err.message);
    }
  };

  return (
    <div className="jobs-page">
      <h1 className="section-title">Find your next opportunity</h1>

      <div className="jobs-toolbar card">
        <div className="job-search">
          <Search size={18} />
          <input
            placeholder="Search by title, company, location"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)} className="job-type-select">
          <option>All</option>
          <option>Full-time</option>
          <option>Contract</option>
          <option>Remote</option>
        </select>
      </div>

      <div className="job-list">
        {filtered.map((job) => {
          const keyId = job._id || job.id;
          const isJobSaved = saved[job._id] || saved[job.id];
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
                <p className="job-company">{job.company}</p>
                <p className="job-meta">
                  <span><MapPin size={14} /> {job.location}</span>
                  <span className="job-type">{job.type}</span>
                  <span>{job.salary}</span>
                </p>
                <div className="job-skills">
                  {(job.skills || []).slice(0, 3).map((s) => (
                    <span className="tag" key={s}>{s}</span>
                  ))}
                </div>
              </div>
              <button
                className="save-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSave(job.id, job._id);
                }}
                aria-label="Save job"
              >
                {isJobSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
              </button>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="card empty-state">No jobs match your search.</div>
        )}
      </div>
    </div>
  );
}

export default Jobs;
