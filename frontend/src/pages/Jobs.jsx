import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Bookmark, BookmarkCheck } from "lucide-react";
import { jobs } from "../data/dummyData";
import "./Jobs.css";

function Jobs() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [saved, setSaved] = useState({});

  const filtered = jobs.filter((j) => {
    const matchQ =
      (j.title + j.company + j.location).toLowerCase().includes(query.toLowerCase());
    const matchT = type === "All" || j.type === type;
    return matchQ && matchT;
  });

  const toggleSave = (id) =>
    setSaved((s) => ({ ...s, [id]: !s[id] }));

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
        {filtered.map((job) => (
          <div key={job.id} className="card job-card-row" onClick={() => navigate(`/jobs/${job.id}`)}>
            <div className="job-logo" style={{ background: job.logoColor }}>
              {job.logo}
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
                {job.skills.slice(0, 3).map((s) => (
                  <span className="tag" key={s}>{s}</span>
                ))}
              </div>
            </div>
            <button
              className="save-btn"
              onClick={(e) => {
                e.stopPropagation();
                toggleSave(job.id);
              }}
              aria-label="Save job"
            >
              {saved[job.id] ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
            </button>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="card empty-state">No jobs match your search.</div>
        )}
      </div>
    </div>
  );
}

export default Jobs;
