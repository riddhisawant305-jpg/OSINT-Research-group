import React from "react";
import { useNavigate } from "react-router-dom";
import { Edit, BadgeCheck, MapPin, Briefcase, Users } from "lucide-react";
import { currentUser, posts } from "../data/dummyData";
import Avatar from "../component/Avatar";
import PostCard from "../component/PostCard";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const myPosts = posts.filter((p) => p.user.id === currentUser.id);

  return (
    <div className="profile-layout">
      <div className="profile-column">
        <div className="card profile-hero">
          <div className="profile-cover"></div>
          <div className="profile-hero-body">
            <Avatar user={currentUser} size={120} />
            <button className="edit-btn" onClick={() => navigate("/edit-profile")}>
              <Edit size={16} /> Edit Profile
            </button>
            <h1>{currentUser.name}</h1>
            <p className="headline">{currentUser.headline}</p>
            <div className="meta-line">
              <span><MapPin size={14} /> {currentUser.location}</span>
              <span><Briefcase size={14} /> {currentUser.experience[0].company}</span>
            </div>
            <div className="meta-line">
              <span><Users size={14} /> {currentUser.connections} connections</span>
              <span><BadgeCheck size={14} style={{ color: "var(--cv-blue)" }} /> Open to work</span>
            </div>
          </div>
        </div>

        <div className="card profile-section">
          <h3>About</h3>
          <p>{currentUser.about}</p>
        </div>

        <div className="card profile-section">
          <h3>Experience</h3>
          {currentUser.experience.map((exp, i) => (
            <div className="exp-row" key={i}>
              <div className="exp-dot">{exp.company[0]}</div>
              <div>
                <strong>{exp.role}</strong>
                <span>{exp.company}</span>
                <small>{exp.duration}</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="profile-column side">
        <div className="card profile-section">
          <h3>Skills</h3>
          <div className="skill-tags">
            {currentUser.skills.map((s) => (
              <span className="tag" key={s}>{s}</span>
            ))}
          </div>
        </div>

        <div className="card profile-section">
          <h3>Education</h3>
          <div className="exp-row">
            <div className="exp-dot">🎓</div>
            <div>
              <strong>{currentUser.education.split(",")[0]}</strong>
              <span>{currentUser.education.split(",").slice(1).join(",")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-posts">
        <h2 className="section-title">Activity</h2>
        {myPosts.length ? (
          myPosts.map((p) => <PostCard key={p.id} post={p} />)
        ) : (
          <div className="card empty-state">No posts yet — share something!</div>
        )}
      </div>
    </div>
  );
}

export default Profile;
