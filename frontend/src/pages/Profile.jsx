import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  MapPin,
  Briefcase,
  Users,
  FolderGit2,
  Sparkles,
  ExternalLink,
  FileText,
  Download,
  CheckCircle,
  Building,
  Globe,
  Mail,
  Phone,
  ArrowLeft,
} from "lucide-react";
import { currentUser as fallbackUser } from "../data/dummyData";
import { useAuth } from "../context/AuthContext";
import API from "../api/client";
import Avatar from "../component/Avatar";
import PostCard from "../component/PostCard";
import ResumeOptimizerModal from "../component/ResumeOptimizerModal";
import "./Profile.css";

function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const isOwnProfile = !id || (user && (id === user._id || id === user.id));
  const [profileUser, setProfileUser] = useState(isOwnProfile ? (user || fallbackUser) : null);
  const [loading, setLoading] = useState(!isOwnProfile);
  const [error, setError] = useState(null);

  const [myPosts, setMyPosts] = useState([]);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [optimizerOpen, setOptimizerOpen] = useState(false);

  // Download helper for Base64 Data URI or file URLs
  const handleDownloadResume = (resumeData, filename) => {
    if (!resumeData) return;
    const downloadName = filename || "Resume.pdf";
    const link = document.createElement("a");
    link.href = resumeData;
    link.download = downloadName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      if (isOwnProfile) {
        setProfileUser(user || fallbackUser);
        try {
          const [postsRes, dashRes] = await Promise.all([
            API.get("/posts"),
            API.get("/users/me/dashboard"),
          ]);

          if (!isMounted) return;

          const activeU = user || fallbackUser;
          if (postsRes.data && postsRes.data.data) {
            const userPosts = postsRes.data.data.filter(
              (p) =>
                p.user &&
                (p.user._id === activeU._id ||
                  p.user.id === activeU._id ||
                  p.user.name === activeU.name)
            );
            setMyPosts(userPosts);
          }

          if (dashRes.data && dashRes.data.data) {
            if (dashRes.data.data.careerStats) {
              setConnectionsCount(dashRes.data.data.careerStats.connectionsCount || 0);
            }
            if (dashRes.data.data.user) {
              setProfileUser((prev) => ({ ...prev, ...dashRes.data.data.user }));
            }
          }
        } catch (err) {
          console.warn("Could not fetch own profile activity:", err.message);
        }
      } else {
        setLoading(true);
        setError(null);
        try {
          const [userRes, postsRes] = await Promise.all([
            API.get(`/users/${id}`),
            API.get("/posts"),
          ]);

          if (!isMounted) return;

          if (userRes.data && userRes.data.data) {
            const fetchedU = userRes.data.data;
            setProfileUser(fetchedU);
            setConnectionsCount(fetchedU.connections || 0);

            if (postsRes.data && postsRes.data.data) {
              const userPosts = postsRes.data.data.filter(
                (p) =>
                  p.user &&
                  (p.user._id === fetchedU._id ||
                    p.user.id === fetchedU._id ||
                    p.user.name === fetchedU.name)
              );
              setMyPosts(userPosts);
            }
          } else {
            setError("User profile not found");
          }
        } catch (err) {
          console.warn("Could not fetch user profile:", err.message);
          if (isMounted) setError("Profile not found or network error.");
        } finally {
          if (isMounted) setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [id, isOwnProfile, user]);

  if (loading) {
    return (
      <div className="profile-layout">
        <div className="card empty-state" style={{ gridColumn: "1 / -1" }}>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="profile-layout">
        <div className="card empty-state" style={{ gridColumn: "1 / -1" }}>
          <h3>Profile Not Found</h3>
          <p style={{ color: "var(--cv-muted)", marginTop: 6 }}>
            {error || "The requested profile could not be loaded."}
          </p>
          <button
            className="btn-primary"
            style={{ marginTop: 14 }}
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} style={{ marginRight: 6 }} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const activeUser = profileUser;
  const isOrganization = activeUser.role === "organization";

  // Organization View Rendering
  if (isOrganization) {
    const orgCompany = activeUser.companyName || activeUser.name || "Organization";
    const orgIndustry = activeUser.companyIndustry || activeUser.organizationDetails?.industry || "Technology";
    const orgWebsite = activeUser.companyWebsite || activeUser.organizationDetails?.website;
    const orgSize = activeUser.companySize || "10-50 employees";
    const orgAbout = activeUser.about || activeUser.organizationDetails?.about || "Hiring top talent on CareerVerse.";
    const postedJobs = activeUser.postedJobs || [];
    const hr = activeUser.hrDetails || {};

    return (
      <div className="profile-layout org-layout">
        {!isOwnProfile && (
          <div style={{ gridColumn: "1 / -1" }}>
            <button className="back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} /> Back
            </button>
          </div>
        )}

        <div className="profile-column">
          {/* Organization Hero Card */}
          <div className="card profile-hero">
            <div className="profile-cover org-cover"></div>
            <div className="profile-hero-body">
              <div
                className="org-logo-badge"
                style={{ background: activeUser.avatarColor || "#2563eb" }}
              >
                {orgCompany.slice(0, 2).toUpperCase()}
              </div>

              <div className="org-hero-title">
                <h1>{orgCompany}</h1>
                <span className="org-verified-pill">
                  <Building size={14} /> Verified Organization
                </span>
              </div>

              <p className="headline">{orgIndustry} • Hiring Partner</p>

              <div className="meta-line">
                <span>
                  <MapPin size={14} /> {activeUser.location || "India"}
                </span>
                <span>
                  <Users size={14} /> {orgSize}
                </span>
                {orgWebsite && (
                  <span>
                    <Globe size={14} />
                    <a
                      href={orgWebsite.startsWith("http") ? orgWebsite : `https://${orgWebsite}`}
                      target="_blank"
                      rel="noreferrer"
                      className="org-website-link"
                    >
                      {orgWebsite.replace(/^https?:\/\//, "")} <ExternalLink size={12} />
                    </a>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* About Company */}
          <div className="card profile-section">
            <h3>About the Company</h3>
            <p>{orgAbout}</p>
          </div>

          {/* Listed Jobs / Open Positions */}
          <div className="card profile-section">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                <Briefcase size={18} color="var(--cv-blue)" /> Open Positions
              </h3>
              <span style={{ fontSize: 13, color: "var(--cv-muted)" }}>
                {postedJobs.length} {postedJobs.length === 1 ? "opening" : "openings"}
              </span>
            </div>

            {postedJobs.length === 0 ? (
              <p style={{ color: "var(--cv-muted)", fontStyle: "italic", fontSize: 13.5 }}>
                No active openings listed right now. Check back soon!
              </p>
            ) : (
              <div className="org-jobs-list">
                {postedJobs.map((job) => (
                  <div key={job._id || job.id} className="org-job-card">
                    <div className="org-job-info">
                      <h4>{job.title}</h4>
                      <div className="org-job-meta">
                        <span><MapPin size={13} /> {job.location}</span>
                        <span className="job-type-pill">{job.type}</span>
                        {job.workplaceType && <span className="job-workplace-pill">{job.workplaceType}</span>}
                        {job.salary && <span>💰 {job.salary}</span>}
                      </div>
                      {job.skills && job.skills.length > 0 && (
                        <div className="org-job-skills">
                          {job.skills.slice(0, 4).map((s) => (
                            <span key={s} className="tag">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      className="btn-primary org-apply-btn"
                      onClick={() => navigate(`/jobs/${job._id || job.numericId || job.id}`)}
                    >
                      View & Apply
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Organization Sidebar */}
        <div className="profile-column side">
          {/* HR & Hiring Contact Card */}
          <div className="card profile-section">
            <h3>HR & Recruitment Team</h3>
            <div className="hr-contact-box">
              <div className="hr-contact-row">
                <Users size={16} color="var(--cv-blue)" />
                <div>
                  <strong>{hr.name || activeUser.name || "Talent Acquisition"}</strong>
                  <small>Hiring Manager</small>
                </div>
              </div>
              {(hr.email || activeUser.email) && (
                <div className="hr-contact-row">
                  <Mail size={16} color="var(--cv-muted)" />
                  <a href={`mailto:${hr.email || activeUser.email}`} className="hr-link">
                    {hr.email || activeUser.email}
                  </a>
                </div>
              )}
              {hr.phone && (
                <div className="hr-contact-row">
                  <Phone size={16} color="var(--cv-muted)" />
                  <span>{hr.phone}</span>
                </div>
              )}
            </div>
          </div>

          <div className="card profile-section">
            <h3>Company Highlights</h3>
            <ul className="org-highlights-list">
              <li>Verified CareerVerse Employer</li>
              <li>Actively reviewing applications</li>
              <li>Transparent hiring process</li>
            </ul>
          </div>
        </div>

        {/* Company Posts / Activity */}
        <div className="profile-posts">
          <h2 className="section-title">Company Updates & Activity</h2>
          {myPosts.length ? (
            myPosts.map((p) => <PostCard key={p._id || p.id} post={p} />)
          ) : (
            <div className="card empty-state">No company posts yet.</div>
          )}
        </div>
      </div>
    );
  }

  // Candidate View Rendering
  const skillsList = Array.isArray(activeUser.skills)
    ? activeUser.skills
    : typeof activeUser.skills === "string"
    ? activeUser.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const expList =
    Array.isArray(activeUser.experience) && activeUser.experience.length > 0
      ? activeUser.experience
      : [
          {
            role: activeUser.headline || "Software Professional",
            company: "CareerVerse",
            duration: "2024 - Present",
          },
        ];

  const projectsList = Array.isArray(activeUser.projects) ? activeUser.projects : [];
  const currentCompany = expList[0]?.company || "CareerVerse";

  const eduMain = activeUser.education
    ? activeUser.education.split(",")[0]
    : "B.Tech / Degree";
  const eduSub = activeUser.education
    ? activeUser.education.split(",").slice(1).join(",")
    : "";

  return (
    <div className="profile-layout">
      {!isOwnProfile && (
        <div style={{ gridColumn: "1 / -1" }}>
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Back
          </button>
        </div>
      )}

      <div className="profile-column">
        {/* Hero Card */}
        <div className="card profile-hero">
          <div className="profile-cover"></div>
          <div className="profile-hero-body">
            <Avatar user={activeUser} size={120} />

            {isOwnProfile && (
              <button
                type="button"
                className="edit-btn ai-opt-btn"
                onClick={() => setOptimizerOpen(true)}
                title="Upload resume to automatically fill & optimize your profile with Gemini"
              >
                <Sparkles size={16} color="#7c3aed" /> Optimize with AI Resume
              </button>
            )}

            <h1>{activeUser.name}</h1>
            <p className="headline">{activeUser.headline}</p>
            <div className="meta-line">
              <span>
                <MapPin size={14} /> {activeUser.location || "India"}
              </span>
              <span>
                <Briefcase size={14} /> {currentCompany}
              </span>
            </div>
            <div className="meta-line">
              <span>
                <Users size={14} /> {connectionsCount} connections
              </span>
              <span>
                <BadgeCheck size={14} style={{ color: "var(--cv-blue)" }} /> Open to work
              </span>
            </div>
          </div>
        </div>

        {/* Saved Resume Card for Profile Owner */}
        {isOwnProfile && (
          <div className="card profile-section resume-status-card">
            <div className="resume-status-header">
              <div className="resume-icon-badge">
                <FileText size={22} color="var(--cv-blue)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0, fontSize: 16 }}>Saved Application Resume</h3>
                  {activeUser.resume && (
                    <span className="resume-active-badge">
                      <CheckCircle size={12} /> Active for Applications
                    </span>
                  )}
                </div>
                <span className="resume-status-sub">
                  {activeUser.resume
                    ? "This resume is saved in your profile and is automatically attached when you apply for jobs."
                    : "No resume saved yet. Upload your resume to optimize your profile and enable one-click applications."}
                </span>
              </div>
            </div>

            {activeUser.resume ? (
              <div className="resume-file-info">
                <div className="resume-file-row">
                  <div className="resume-file-title">
                    <FileText size={18} color="#dc2626" />
                    <div>
                      <strong>{activeUser.resumeFileName || "Candidate_Resume.pdf"}</strong>
                      <small>
                        Saved {activeUser.resumeUpdatedAt ? new Date(activeUser.resumeUpdatedAt).toLocaleDateString() : "recently"}
                      </small>
                    </div>
                  </div>

                  <div className="resume-file-actions">
                    <button
                      type="button"
                      className="btn-outline resume-action-btn"
                      onClick={() =>
                        handleDownloadResume(activeUser.resume, activeUser.resumeFileName)
                      }
                      title="View / Download your saved resume"
                    >
                      <Download size={14} /> Download Resume
                    </button>
                    <button
                      type="button"
                      className="btn-outline resume-action-btn reopt-btn"
                      onClick={() => setOptimizerOpen(true)}
                      title="Upload a new resume to re-optimize"
                    >
                      <Sparkles size={14} color="#7c3aed" /> Re-Optimize
                    </button>
                  </div>
                </div>

                <div className="resume-notice-box">
                  <CheckCircle size={15} color="#059669" />
                  <span>
                    <strong>Resume on file:</strong> Whenever you click "Apply Now" on any job, this saved resume is automatically submitted to recruiters.
                  </span>
                </div>
              </div>
            ) : (
              <div className="resume-empty-prompt">
                <p>
                  Save time applying! Use our Gemini AI Resume Optimizer to parse your resume, enhance your profile details, and save your resume file for instant 1-click job applications.
                </p>
                <button
                  type="button"
                  className="btn-primary resume-upload-btn"
                  onClick={() => setOptimizerOpen(true)}
                >
                  <Sparkles size={15} /> Upload Resume & Optimize Profile
                </button>
              </div>
            )}
          </div>
        )}

        {/* About Section */}
        <div className="card profile-section">
          <h3>About</h3>
          <p>{activeUser.about || "Passionate professional building the future of tech on CareerVerse."}</p>
        </div>

        {/* Experience Section */}
        <div className="card profile-section">
          <h3>Experience</h3>
          {expList.map((exp, i) => (
            <div className="exp-row" key={i}>
              <div className="exp-dot">{exp.company ? exp.company[0] : "C"}</div>
              <div>
                <strong>{exp.role}</strong>
                <span>{exp.company}</span>
                <small>
                  {exp.duration ||
                    (exp.startDate
                      ? `${exp.startDate} - ${exp.endDate || "Present"}`
                      : "Present")}
                </small>
                {exp.description && (
                  <p style={{ marginTop: "4px", fontSize: "13px", color: "#4b5563" }}>
                    {exp.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Projects Section */}
        <div className="card profile-section">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "14px",
            }}
          >
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
              <FolderGit2 size={18} color="var(--cv-blue)" /> Projects
            </h3>
            {projectsList.length > 0 && (
              <span style={{ fontSize: "12px", color: "var(--cv-muted)" }}>
                {projectsList.length} {projectsList.length === 1 ? "project" : "projects"}
              </span>
            )}
          </div>

          {projectsList.length === 0 ? (
            <p style={{ color: "var(--cv-muted)", fontSize: "13.5px", fontStyle: "italic", margin: 0 }}>
              {isOwnProfile
                ? "No projects showcased yet. Click \"Edit Profile\" or use \"Optimize with AI Resume\" to showcase your projects."
                : "No projects showcased yet."}
            </p>
          ) : (
            <div className="projects-grid">
              {projectsList.map((proj, i) => (
                <div key={proj._id || i} className="project-card">
                  <div className="project-card-header">
                    <h4>{proj.title}</h4>
                    {proj.link && (
                      <a
                        href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`}
                        target="_blank"
                        rel="noreferrer"
                        className="project-link-btn"
                        title="Open project link"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                  {proj.duration && <small className="project-duration">{proj.duration}</small>}
                  {proj.description && <p className="project-desc">{proj.description}</p>}
                  {Array.isArray(proj.technologies) && proj.technologies.length > 0 && (
                    <div className="project-tech-tags">
                      {proj.technologies.map((t, ti) => (
                        <span key={ti} className="project-tech-pill">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Side Column */}
      <div className="profile-column side">
        <div className="card profile-section">
          <h3>Skills</h3>
          <div className="skill-tags">
            {skillsList.map((s) => (
              <span className="tag" key={s}>
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="card profile-section">
          <h3>Education</h3>
          <div className="exp-row">
            <div className="exp-dot">🎓</div>
            <div>
              <strong>{eduMain}</strong>
              {eduSub && <span>{eduSub}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="profile-posts">
        <h2 className="section-title">Activity</h2>
        {myPosts.length ? (
          myPosts.map((p) => <PostCard key={p._id || p.id} post={p} />)
        ) : (
          <div className="card empty-state">No posts yet.</div>
        )}
      </div>

      {isOwnProfile && (
        <ResumeOptimizerModal
          isOpen={optimizerOpen}
          onClose={() => setOptimizerOpen(false)}
          onApplySuccess={(updated) => updateUser(updated)}
        />
      )}
    </div>
  );
}

export default Profile;
