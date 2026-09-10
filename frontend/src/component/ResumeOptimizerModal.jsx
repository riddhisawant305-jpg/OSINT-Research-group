import React, { useState, useRef } from "react";
import {
  Sparkles,
  Upload,
  FileText,
  CheckCircle,
  X,
  AlertCircle,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Layers,
} from "lucide-react";
import API from "../api/client";
import "./ResumeOptimizerModal.css";

function ResumeOptimizerModal({ isOpen, onClose, onApplySuccess }) {
  const [activeTab, setActiveTab] = useState("file"); // "file" | "text"
  const [selectedFile, setSelectedFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [extractedData, setExtractedData] = useState(null);
  const [applying, setApplying] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError("File size exceeds 8MB. Please select a smaller resume file.");
      return;
    }
    setSelectedFile(file);
    setError("");
  };

  const handleAnalyze = async () => {
    setError("");
    if (activeTab === "file" && !selectedFile) {
      setError("Please select a resume file (PDF or TXT) to analyze.");
      return;
    }
    if (activeTab === "text" && !resumeText.trim()) {
      setError("Please paste your resume text to analyze.");
      return;
    }

    setLoading(true);
    try {
      let res;
      if (activeTab === "file") {
        const formData = new FormData();
        formData.append("resume", selectedFile);
        res = await API.post("/career/optimize-profile-from-resume", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await API.post("/career/optimize-profile-from-resume", {
          text: resumeText.trim(),
        });
      }

      if (res.data && res.data.data) {
        setExtractedData(res.data.data);
      } else {
        throw new Error("No structured profile returned by Gemini");
      }
    } catch (err) {
      console.error("Resume optimization error:", err);
      let msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to analyze resume. Please check your Gemini API key in backend/.env.";

      if (
        msg.includes("503") ||
        msg.includes("high demand") ||
        msg.includes("Service Unavailable")
      ) {
        msg = "Google Gemini is temporarily experiencing high server demand. Please wait a few seconds and click 'Analyze & Optimize' again.";
      } else if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
        msg = "Gemini API rate limit reached. Please wait a few seconds and try again.";
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!extractedData) return;
    setApplying(true);
    try {
      const payload = {
        name: extractedData.name,
        headline: extractedData.headline,
        about: extractedData.about,
        location: extractedData.location,
        phone: extractedData.phone,
        education: extractedData.education,
        skills: extractedData.skills || [],
        hobbies: extractedData.hobbies || [],
        experience: extractedData.experience || [],
        projects: extractedData.projects || [],
        resume: extractedData.resume || "",
        resumeFileName: extractedData.resumeFileName || "",
        resumeFileType: extractedData.resumeFileType || "",
        resumeUpdatedAt: new Date(),
      };

      const res = await API.put("/users/me", payload);
      if (res.data && res.data.data) {
        if (onApplySuccess) {
          onApplySuccess(res.data.data);
        }
      }
      handleClose();
    } catch (err) {
      console.error("Failed to apply profile:", err);
      setError("Could not apply profile to backend: " + (err.response?.data?.message || err.message));
    } finally {
      setApplying(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setResumeText("");
    setError("");
    setExtractedData(null);
    setLoading(false);
    setApplying(false);
    onClose();
  };

  return (
    <div className="resume-modal-overlay" onClick={handleClose}>
      <div
        className="resume-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="resume-modal-head">
          <div className="resume-modal-title">
            <div className="resume-modal-icon">
              <Sparkles size={20} />
            </div>
            <div>
              <h3>AI Resume-to-Profile Optimizer</h3>
              <p>Powered by CareerVerse Agentic AI Model — upload your resume to optimize your profile</p>
            </div>
          </div>
          <button className="resume-modal-close" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        <div className="resume-modal-body">
          {error && (
            <div className="resume-modal-alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {!extractedData && (
            <>
              <div className="resume-modal-tabs">
                <button
                  className={"resume-tab-btn" + (activeTab === "file" ? " active" : "")}
                  onClick={() => setActiveTab("file")}
                >
                  <Upload size={15} /> Upload Resume File
                </button>
                <button
                  className={"resume-tab-btn" + (activeTab === "text" ? " active" : "")}
                  onClick={() => setActiveTab("text")}
                >
                  <FileText size={15} /> Paste Text
                </button>
              </div>

              {activeTab === "file" ? (
                <div
                  className={"resume-dropzone" + (selectedFile ? " has-file" : "")}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,.txt,.docx,.md"
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                  />
                  <div className="dropzone-icon">
                    <Upload size={28} />
                  </div>
                  {selectedFile ? (
                    <div className="dropzone-file-info">
                      <strong>{selectedFile.name}</strong>
                      <span>{(selectedFile.size / 1024).toFixed(1)} KB • Click to change file</span>
                    </div>
                  ) : (
                    <div className="dropzone-hint">
                      <strong>Click to browse or drop your resume here</strong>
                      <span>Supports PDF, TXT, DOCX (up to 8MB)</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="resume-text-input">
                  <textarea
                    rows={6}
                    placeholder="Paste the text of your resume here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                </div>
              )}

              <div className="resume-modal-actions">
                <button type="button" className="btn-outline" onClick={handleClose}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary resume-analyze-btn"
                  onClick={handleAnalyze}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="resume-spinner"></div>
                      <span>Agentic AI is analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Analyze & Optimize</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {extractedData && (
            <div className="extracted-preview-wrapper">
              <div className="extracted-banner">
                <CheckCircle size={20} color="#16a34a" />
                <div>
                  <strong>Resume successfully analyzed & optimized!</strong>
                  <p>Review the extracted information below before applying it to your CareerVerse profile.</p>
                </div>
              </div>

              <div className="extracted-sections-list">
                {extractedData.headline && (
                  <div className="extracted-item">
                    <span className="extracted-label">Professional Headline</span>
                    <h4>{extractedData.headline}</h4>
                  </div>
                )}

                {extractedData.about && (
                  <div className="extracted-item">
                    <span className="extracted-label">About / Bio</span>
                    <p>{extractedData.about}</p>
                  </div>
                )}

                {Array.isArray(extractedData.skills) && extractedData.skills.length > 0 && (
                  <div className="extracted-item">
                    <span className="extracted-label">
                      <Layers size={14} /> Skills ({extractedData.skills.length})
                    </span>
                    <div className="extracted-tags">
                      {extractedData.skills.map((skill, i) => (
                        <span key={i} className="skill-pill">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {Array.isArray(extractedData.hobbies) && extractedData.hobbies.length > 0 && (
                  <div className="extracted-item">
                    <span className="extracted-label">
                      <Sparkles size={14} /> Hobbies & Interests ({extractedData.hobbies.length})
                    </span>
                    <div className="extracted-tags">
                      {extractedData.hobbies.map((hobby, i) => (
                        <span key={i} className="skill-pill" style={{ background: "#ecfdf5", color: "#047857", borderColor: "#a7f3d0" }}>
                          {hobby}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {Array.isArray(extractedData.experience) && extractedData.experience.length > 0 && (
                  <div className="extracted-item">
                    <span className="extracted-label">
                      <Briefcase size={14} /> Experience ({extractedData.experience.length} roles)
                    </span>
                    <div className="extracted-sublist">
                      {extractedData.experience.map((exp, i) => (
                        <div key={i} className="extracted-subcard">
                          <strong>{exp.role}</strong> — <span>{exp.company}</span>
                          <small>{exp.duration || "Present"}</small>
                          {exp.description && <p>{exp.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Array.isArray(extractedData.projects) && extractedData.projects.length > 0 && (
                  <div className="extracted-item">
                    <span className="extracted-label">
                      <FolderGit2 size={14} /> Projects ({extractedData.projects.length} projects)
                    </span>
                    <div className="extracted-sublist">
                      {extractedData.projects.map((proj, i) => (
                        <div key={i} className="extracted-subcard">
                          <strong>{proj.title}</strong>
                          {proj.description && <p>{proj.description}</p>}
                          {Array.isArray(proj.technologies) && proj.technologies.length > 0 && (
                            <div className="extracted-tags mini-tags">
                              {proj.technologies.map((t, ti) => (
                                <span key={ti} className="tech-badge">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {extractedData.education && (
                  <div className="extracted-item">
                    <span className="extracted-label">
                      <GraduationCap size={14} /> Education
                    </span>
                    <p>{extractedData.education}</p>
                  </div>
                )}
              </div>

              <div className="resume-modal-actions preview-actions">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setExtractedData(null)}
                >
                  Re-upload / Back
                </button>
                <button
                  type="button"
                  className="btn-primary apply-btn"
                  onClick={handleApply}
                  disabled={applying}
                >
                  {applying ? (
                    <>
                      <div className="resume-spinner"></div>
                      <span>Saving to Profile...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      <span>Apply to My Profile</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResumeOptimizerModal;
