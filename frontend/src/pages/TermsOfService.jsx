import React from "react";
import { FileText, Shield, CheckCircle, Lock, AlertCircle } from "lucide-react";
import "./TermsOfService.css";

function TermsOfService() {
  return (
    <div className="policy-page">
      <div className="policy-header">
        <div className="policy-badge"><FileText size={16} /> Legal & Standards</div>
        <h1>CareerVerse Terms of Service</h1>
        <p className="policy-sub">Effective Date: January 1, 2026 • Last Updated: September 2026</p>
      </div>

      <div className="policy-card">
        <section className="policy-section">
          <h2>1. Agreement to Terms</h2>
          <p>
            By registering, accessing, or using the CareerVerse platform as a student candidate or hiring organization, you agree to comply with and be bound by these Terms of Service.
          </p>
        </section>

        <section className="policy-section">
          <h2>2. Candidate User Commitments</h2>
          <ul>
            <li>You agree to provide accurate, truthful representation of your identity, educational background, skills, and work experience.</li>
            <li>Uploaded resumes and portfolios must be authentic and belong to the registered account owner.</li>
            <li>Feed posts and community comments must remain respectful, professional, and free of harassment or spam.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. Hiring Organization Commitments</h2>
          <ul>
            <li>Companies and recruiters agree to list only genuine, active job openings with fair descriptions of compensation and requirements.</li>
            <li>Applicant information and resumes must be used solely for hiring evaluation and not shared with unauthorized third parties.</li>
            <li>Recruiters commit to updating application statuses (Reviewed, Interviewing, Accepted, Rejected) in good faith to respect candidate time and effort.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>4. Moderation & Reason-Mandated Deletion</h2>
          <p>
            To maintain high community standards, platform Super Administrators actively moderate accounts, posts, and job listings. In the event of a guideline violation (e.g. fraudulent postings, spam, or harassment), items may be deleted. The administrator is mandated to provide an explicit reason, which is automatically delivered via email to the affected account holder.
          </p>
        </section>

        <section className="policy-section">
          <h2>5. 100% Online Support & Contact</h2>
          <p>
            If you have questions regarding these terms, disputes, or account moderation, please contact our dedicated 100% online email support team at <a href="mailto:careerverse999@gmail.com">careerverse999@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}

export default TermsOfService;
