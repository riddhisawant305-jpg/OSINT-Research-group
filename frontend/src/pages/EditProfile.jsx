import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Sparkles, FolderGit2 } from "lucide-react";
import { currentUser as fallbackUser } from "../data/dummyData";
import { useAuth } from "../context/AuthContext";
import API from "../api/client";
import ResumeOptimizerModal from "../component/ResumeOptimizerModal";
import "./EditProfile.css";

function EditProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const activeUser = user || fallbackUser;
  const fileInputRef = useRef(null);

  const initialSkills = Array.isArray(activeUser.skills)
    ? activeUser.skills.join(", ")
    : activeUser.skills || "";

  const [form, setForm] = useState({
    name: activeUser.name || "",
    headline: activeUser.headline || "",
    location: activeUser.location || "",
    email: activeUser.email || "",
    phone: activeUser.phone || "",
    about: activeUser.about || "",
    education: activeUser.education || "",
    skills: initialSkills,
  });

  const [profilePhoto, setProfilePhoto] = useState(activeUser.profilePhoto || "");

  const initialExp = Array.isArray(activeUser.experience) && activeUser.experience.length > 0
    ? activeUser.experience.map((exp) => ({
        role: exp.role || "",
        company: exp.company || "",
        duration: exp.duration || "",
        location: exp.location || "",
        description: exp.description || "",
      }))
    : [
        {
          role: activeUser.headline || "Frontend Developer",
          company: "CareerVerse",
          duration: "2024 - Present",
          location: activeUser.location || "",
          description: "",
        },
      ];

  const initialProjects = Array.isArray(activeUser.projects) && activeUser.projects.length > 0
    ? activeUser.projects.map((p) => ({
        title: p.title || "",
        technologies: Array.isArray(p.technologies) ? p.technologies.join(", ") : p.technologies || "",
        link: p.link || "",
        duration: p.duration || "",
        description: p.description || "",
      }))
    : [];

  const [experienceList, setExperienceList] = useState(initialExp);
  const [projectsList, setProjectsList] = useState(initialProjects);
  const [optimizerOpen, setOptimizerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhotoChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image smaller than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const addExperience = () => {
    setExperienceList([
      ...experienceList,
      { role: "", company: "", duration: "", location: "", description: "" },
    ]);
  };

  const updateExperience = (index, field, value) => {
    setExperienceList(
      experienceList.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeExperience = (index) => {
    setExperienceList(experienceList.filter((_, i) => i !== index));
  };

  const addProject = () => {
    setProjectsList([
      ...projectsList,
      { title: "", technologies: "", link: "", duration: "", description: "" },
    ]);
  };

  const updateProject = (index, field, value) => {
    setProjectsList(
      projectsList.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeProject = (index) => {
    setProjectsList(projectsList.filter((_, i) => i !== index));
  };

  const handleApplyExtractedProfile = (updatedData) => {
    updateUser(updatedData);
    setForm({
      name: updatedData.name || form.name,
      headline: updatedData.headline || form.headline,
      location: updatedData.location || form.location,
      email: updatedData.email || form.email,
      phone: updatedData.phone || form.phone,
      about: updatedData.about || form.about,
      education: updatedData.education || form.education,
      skills: Array.isArray(updatedData.skills)
        ? updatedData.skills.join(", ")
        : updatedData.skills || form.skills,
    });

    if (Array.isArray(updatedData.experience) && updatedData.experience.length > 0) {
      setExperienceList(updatedData.experience);
    }
    if (Array.isArray(updatedData.projects) && updatedData.projects.length > 0) {
      setProjectsList(
        updatedData.projects.map((p) => ({
          title: p.title || "",
          technologies: Array.isArray(p.technologies) ? p.technologies.join(", ") : p.technologies || "",
          link: p.link || "",
          duration: p.duration || "",
          description: p.description || "",
        }))
      );
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);

    const validExperiences = experienceList.filter(
      (exp) => exp.role.trim() || exp.company.trim()
    );

    const validProjects = projectsList
      .filter((proj) => proj.title.trim())
      .map((proj) => ({
        ...proj,
        technologies: proj.technologies
          ? proj.technologies.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      }));

    const payload = {
      ...form,
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      profilePhoto: profilePhoto,
      experience: validExperiences,
      projects: validProjects,
    };

    try {
      const res = await API.put("/users/me", payload);
      if (res.data && res.data.data) {
        updateUser(res.data.data);
      }
      navigate("/profile");
    } catch (err) {
      console.warn("Could not save to backend:", err.message);
      updateUser(payload);
      navigate("/profile");
    } finally {
      setSaving(false);
    }
  };

  const initials = activeUser.initials || (activeUser.name ? activeUser.name.slice(0, 2).toUpperCase() : "CV");

  return (
    <div className="edit-profile-page">
      <div className="edit-head" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button className="back-btn" onClick={() => navigate("/profile")}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="section-title">Edit Profile</h1>
        </div>
        <button
          type="button"
          className="btn-outline ai-opt-header-btn"
          style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "8px 14px", borderRadius: "10px", borderColor: "#7c3aed", color: "#7c3aed", fontWeight: "600" }}
          onClick={() => setOptimizerOpen(true)}
          title="Upload your resume to automatically fill all fields with Gemini AI"
        >
          <Sparkles size={15} color="#7c3aed" /> Auto-Fill with AI Resume
        </button>
      </div>

      <form className="card edit-form" onSubmit={save}>
        <div className="edit-photo">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handlePhotoChange}
            style={{ display: "none" }}
          />
          <div className="profile-cover mini-cover"></div>
          <div
            className="profile-avatar-edit"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            style={{ cursor: "pointer", overflow: "hidden" }}
            title="Click to change profile photo"
          >
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              initials
            )}
          </div>
          <p
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            style={{ cursor: "pointer" }}
          >
            {profilePhoto ? "Change profile photo" : "Add a profile photo"}
          </p>
          {profilePhoto && (
            <button
              type="button"
              className="btn-outline"
              style={{
                fontSize: "12px",
                padding: "4px 10px",
                marginTop: "6px",
                borderColor: "#ef4444",
                color: "#ef4444",
              }}
              onClick={() => setProfilePhoto("")}
            >
              Remove Photo
            </button>
          )}
        </div>

        <label>Full Name</label>
        <input name="name" value={form.name} onChange={update} />

        <label>Professional Headline</label>
        <input name="headline" value={form.headline} onChange={update} />

        <label>Location</label>
        <input name="location" value={form.location} onChange={update} />

        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={update} />

        <label>Phone</label>
        <input name="phone" value={form.phone} onChange={update} />

        <label>About</label>
        <textarea name="about" rows={4} value={form.about} onChange={update} />

        <label>Education</label>
        <input name="education" value={form.education} onChange={update} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "18px", marginBottom: "8px" }}>
          <label style={{ margin: 0, fontSize: "14px", fontWeight: "700" }}>Experience</label>
          <button
            type="button"
            className="btn-outline"
            style={{ fontSize: "12px", padding: "4px 12px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "4px" }}
            onClick={addExperience}
          >
            <Plus size={14} /> Add Experience
          </button>
        </div>

        {experienceList.length === 0 && (
          <p style={{ fontSize: "13px", color: "var(--cv-muted)", fontStyle: "italic", marginBottom: "12px" }}>
            No experience entries. Click "+ Add Experience" above to add one.
          </p>
        )}

        {experienceList.map((exp, idx) => (
          <div
            key={idx}
            className="card"
            style={{
              padding: "14px",
              marginBottom: "12px",
              background: "#f9fafb",
              border: "1px solid var(--cv-border)",
              borderRadius: "10px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--cv-blue)" }}>
                Experience #{idx + 1}
              </span>
              <button
                type="button"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#ef4444",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
                onClick={() => removeExperience(idx)}
              >
                <Trash2 size={13} /> Remove
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "12px" }}>Job Role / Title *</label>
                <input
                  value={exp.role}
                  placeholder="e.g. Frontend Developer"
                  onChange={(e) => updateExperience(idx, "role", e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", fontSize: "13px" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "12px" }}>Company *</label>
                <input
                  value={exp.company}
                  placeholder="e.g. CareerVerse"
                  onChange={(e) => updateExperience(idx, "company", e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", fontSize: "13px" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "8px" }}>
              <div>
                <label style={{ fontSize: "12px" }}>Duration</label>
                <input
                  value={exp.duration}
                  placeholder="e.g. 2024 - Present"
                  onChange={(e) => updateExperience(idx, "duration", e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", fontSize: "13px" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "12px" }}>Location (Optional)</label>
                <input
                  value={exp.location}
                  placeholder="e.g. Pune, India or Remote"
                  onChange={(e) => updateExperience(idx, "location", e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", fontSize: "13px" }}
                />
              </div>
            </div>

            <div style={{ marginTop: "8px" }}>
              <label style={{ fontSize: "12px" }}>Description (Optional)</label>
              <textarea
                rows={2}
                value={exp.description}
                placeholder="Brief summary of your achievements and responsibilities"
                onChange={(e) => updateExperience(idx, "description", e.target.value)}
                style={{ width: "100%", padding: "8px 10px", fontSize: "13px" }}
              />
            </div>
          </div>
        ))}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "22px", marginBottom: "8px" }}>
          <label style={{ margin: 0, fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
            <FolderGit2 size={16} color="var(--cv-blue)" /> Projects
          </label>
          <button
            type="button"
            className="btn-outline"
            style={{ fontSize: "12px", padding: "4px 12px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "4px" }}
            onClick={addProject}
          >
            <Plus size={14} /> Add Project
          </button>
        </div>

        {projectsList.length === 0 && (
          <p style={{ fontSize: "13px", color: "var(--cv-muted)", fontStyle: "italic", marginBottom: "12px" }}>
            No projects added yet. Click "+ Add Project" above or use "Auto-Fill with AI Resume".
          </p>
        )}

        {projectsList.map((proj, idx) => (
          <div
            key={idx}
            className="card"
            style={{
              padding: "14px",
              marginBottom: "12px",
              background: "#f9fafb",
              border: "1px solid var(--cv-border)",
              borderRadius: "10px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--cv-blue)" }}>
                Project #{idx + 1}
              </span>
              <button
                type="button"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#ef4444",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
                onClick={() => removeProject(idx)}
              >
                <Trash2 size={13} /> Remove
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "12px" }}>Project Title *</label>
                <input
                  value={proj.title}
                  placeholder="e.g. AI Portfolio Generator"
                  onChange={(e) => updateProject(idx, "title", e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", fontSize: "13px" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "12px" }}>Technologies (comma separated)</label>
                <input
                  value={proj.technologies}
                  placeholder="e.g. React, Node.js, MongoDB"
                  onChange={(e) => updateProject(idx, "technologies", e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", fontSize: "13px" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "8px" }}>
              <div>
                <label style={{ fontSize: "12px" }}>Project / GitHub Link</label>
                <input
                  value={proj.link}
                  placeholder="e.g. https://github.com/..."
                  onChange={(e) => updateProject(idx, "link", e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", fontSize: "13px" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "12px" }}>Duration (Optional)</label>
                <input
                  value={proj.duration}
                  placeholder="e.g. 2024 or 3 months"
                  onChange={(e) => updateProject(idx, "duration", e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", fontSize: "13px" }}
                />
              </div>
            </div>

            <div style={{ marginTop: "8px" }}>
              <label style={{ fontSize: "12px" }}>Description</label>
              <textarea
                rows={2}
                value={proj.description}
                placeholder="Brief summary of what the project does, key features, and your contribution"
                onChange={(e) => updateProject(idx, "description", e.target.value)}
                style={{ width: "100%", padding: "8px 10px", fontSize: "13px" }}
              />
            </div>
          </div>
        ))}

        <label>Skills (comma separated)</label>
        <input name="skills" value={form.skills} onChange={update} />

        <div className="edit-form-actions">
          <button type="button" className="btn-outline" onClick={() => navigate("/profile")}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      <ResumeOptimizerModal
        isOpen={optimizerOpen}
        onClose={() => setOptimizerOpen(false)}
        onApplySuccess={handleApplyExtractedProfile}
      />
    </div>
  );
}

export default EditProfile;
