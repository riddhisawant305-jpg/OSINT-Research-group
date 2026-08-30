import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { currentUser } from "../data/dummyData";
import "./EditProfile.css";

function EditProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: currentUser.name,
    headline: currentUser.headline,
    location: currentUser.location,
    email: currentUser.email,
    phone: currentUser.phone,
    about: currentUser.about,
    education: currentUser.education,
    skills: currentUser.skills.join(", "),
  });

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = (e) => {
    e.preventDefault();
    navigate("/profile");
  };

  return (
    <div className="edit-profile-page">
      <div className="edit-head">
        <button className="back-btn" onClick={() => navigate("/profile")}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="section-title">Edit Profile</h1>
      </div>

      <form className="card edit-form" onSubmit={save}>
        <div className="edit-photo">
          <div className="profile-cover mini-cover"></div>
          <div className="profile-avatar-edit">{currentUser.initials}</div>
          <p>Add a profile photo</p>
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

        <label>Skills (comma separated)</label>
        <input name="skills" value={form.skills} onChange={update} />

        <div className="edit-form-actions">
          <button type="button" className="btn-outline" onClick={() => navigate("/profile")}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">Save Changes</button>
        </div>
      </form>
    </div>
  );
}

export default EditProfile;
