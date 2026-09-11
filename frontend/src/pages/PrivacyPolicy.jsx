import React from "react";
import { Shield, Lock, Eye, FileText, CheckCircle, Mail } from "lucide-react";
import "./PrivacyPolicy.css";

function PrivacyPolicy() {
  return (
    <div className="policy-page">
      <div className="policy-header">
        <div className="policy-badge"><Lock size={16} /> Privacy & Trust</div>
        <h1>CareerVerse Privacy Policy</h1>
        <p className="policy-sub">Effective Date: January 1, 2026 • Last Updated: September 2026</p>
      </div>

      <div className="policy-card">
        <section className="policy-section">
          <h2>1. Introduction</h2>
          <p>
            At CareerVerse, we believe your personal information, career documents, and job applications deserve the highest level of security and respect. This Privacy Policy outlines what information we collect, how we use it to connect students with employers, and your control over your data.
          </p>
        </section>

        <section className="policy-section">
          <h2>2. Information We Collect</h2>
          <ul>
            <li><strong>Candidate Profiles:</strong> Name, email address, headline, location, education, work experience, projects, skills, and optional avatar.</li>
            <li><strong>Resumes & Portfolios:</strong> Uploaded resume PDFs and documents used strictly for application submissions and the AI Resume Analyzer.</li>
            <li><strong>Organization Profiles:</strong> Company name, work email, industry, company website, location, and recruiter contact information.</li>
            <li><strong>Google OAuth Data:</strong> When signing in with Google, we receive only your public profile name, verified email address, and avatar image. We never access your Google contacts, drive, or private Google account data.</li>
            <li><strong>Communication Logs:</strong> Timestamped transactional email records for application status changes, connection alerts, and platform moderation.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. How We Use Your Information</h2>
          <p>Your information is used exclusively to deliver CareerVerse’s modern career and hiring ecosystem:</p>
          <ul>
            <li>Facilitating direct job applications from candidates to verified hiring organizations.</li>
            <li>Attaching candidate resume PDFs to recruiter notification emails upon job application submission.</li>
            <li>Delivering automated notification emails (post interactions, connections, status changes, and interview alerts).</li>
            <li>Powering AI career tools (Resume Analyzer, AI Career Mentor, and Practice Interview).</li>
            <li>Platform safety and fraud prevention via CareerVerse Verified Badges.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>4. Data Sharing & Zero Selling Promise</h2>
          <p>
            <strong>CareerVerse does not sell, rent, or monetize your personal information or resume files to third-party advertisers.</strong> Candidate details and resumes are only shared with organizations you explicitly submit an application to.
          </p>
        </section>

        <section className="policy-section">
          <h2>5. Online Support & Inquiries</h2>
          <p>
            For any privacy inquiries, data deletion requests, or questions regarding our privacy practices, our 100% online support desk is available via direct email at <a href="mailto:careerverse999@gmail.com">careerverse999@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
