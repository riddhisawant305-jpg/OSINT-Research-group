import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  Plus,
  Search,
  Mail,
  FileText,
  Download,
  Edit3,
  Trash2,
  X,
  Clock,
  ArrowLeft,
  Filter,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../api/client";
import "./HiredEmployees.css";

function HiredEmployees() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isOrg = user?.role === "organization" || user?.role === "recruiter";

  // Redirect candidates away
  useEffect(() => {
    if (user && !isOrg) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, isOrg, navigate]);

  const [hiredEmployees, setHiredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [form, setForm] = useState({
    candidateName: "",
    candidateEmail: "",
    employeeId: "",
    role: "",
    salary: "",
    hiredDate: "",
    joiningDate: "",
    notes: "",
    status: "Active",
  });

  const loadHiredEmployees = async () => {
    setLoading(true);
    try {
      const res = await API.get("/users/me/hired-employees");
      if (res.data && res.data.data) {
        setHiredEmployees(res.data.data);
      }
    } catch (err) {
      console.warn("Could not load hired employees:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOrg) {
      loadHiredEmployees();
    }
  }, [isOrg]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      candidateName: "",
      candidateEmail: "",
      employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      role: "",
      salary: "",
      hiredDate: new Date().toISOString().split("T")[0],
      joiningDate: "",
      notes: "",
      status: "Active",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingId(emp._id || emp.id);
    setForm({
      candidateName: emp.candidateName || "",
      candidateEmail: emp.candidateEmail || "",
      employeeId: emp.employeeId || "",
      role: emp.role || "",
      salary: emp.salary || "",
      hiredDate: emp.hiredDate ? new Date(emp.hiredDate).toISOString().split("T")[0] : "",
      joiningDate: emp.joiningDate ? new Date(emp.joiningDate).toISOString().split("T")[0] : "",
      notes: emp.notes || "",
      status: emp.status || "Active",
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      if (editingId) {
        const res = await API.put(`/users/me/hired-employees/${editingId}`, form);
        if (res.data && res.data.data) {
          setHiredEmployees((prev) =>
            prev.map((item) => ((item._id || item.id) === editingId ? res.data.data : item))
          );
        }
      } else {
        const res = await API.post("/users/me/hired-employees", form);
        if (res.data && res.data.data) {
          setHiredEmployees((prev) => [res.data.data, ...prev]);
        }
      }
      setModalOpen(false);
      setEditingId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save hired candidate details.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this employee record from your Hired list?")) {
      return;
    }
    try {
      await API.delete(`/users/me/hired-employees/${id}`);
      setHiredEmployees((prev) => prev.filter((item) => (item._id || item.id) !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove hired employee.");
    }
  };

  const handleDownloadResume = (resumeData, candidateName, filename) => {
    if (!resumeData) return;
    const downloadName =
      filename || `${candidateName ? candidateName.replace(/\s+/g, "_") : "Candidate"}_Resume.pdf`;
    const link = document.createElement("a");
    link.href = resumeData;
    link.download = downloadName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter list
  const filteredEmployees = hiredEmployees.filter((emp) => {
    if (statusFilter !== "All" && (emp.status || "Active") !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const name = (emp.candidateName || "").toLowerCase();
      const email = (emp.candidateEmail || "").toLowerCase();
      const empId = (emp.employeeId || "").toLowerCase();
      const role = (emp.role || "").toLowerCase();
      const notes = (emp.notes || "").toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        empId.includes(q) ||
        role.includes(q) ||
        notes.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="hired-page">
      {/* Header */}
      <div className="hired-head">
        <div className="hired-title-box">
          <button
            type="button"
            className="btn-outline"
            style={{
              padding: "5px 12px",
              fontSize: 13,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 10,
            }}
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <h1>
            <Award size={26} color="var(--cv-blue)" /> Hired from CareerVerse
          </h1>
          <p className="hired-subtitle">
            Permanent records of all candidates hired through CareerVerse. Profiles, compensation, and resumes remain safely stored here even if original job postings are removed.
          </p>
        </div>

        <div className="hired-top-actions">
          <span className="hired-stat-badge">
            <Award size={15} /> {hiredEmployees.length} Total Hired
          </span>
          <button className="btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add Hired Candidate
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="hired-filter-card">
        <div className="hired-search-box">
          <Search size={18} color="var(--cv-muted)" />
          <input
            type="text"
            className="hired-search-input"
            placeholder="Search by candidate name, email, employee ID, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--cv-muted)",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Clear
            </button>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Filter size={15} color="var(--cv-muted)" />
          <select
            className="hired-select-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Joined">Joined</option>
            <option value="Offer Accepted">Offer Accepted</option>
            <option value="Completed">Completed</option>
            <option value="Resigned">Resigned</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <Clock className="animate-spin" size={28} color="var(--cv-blue)" />
          <p style={{ marginTop: 10, color: "var(--cv-muted)" }}>
            Loading hired employee records...
          </p>
        </div>
      ) : hiredEmployees.length === 0 ? (
        <div className="card hired-empty-card">
          <Award size={48} color="#9ca3af" />
          <h3>No Hired Candidates Yet</h3>
          <p>
            When you accept an applicant in your job review screen, they will automatically be recorded here with full details. You can also add candidates manually.
          </p>
          <button className="btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add First Hired Candidate
          </button>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="card hired-empty-card">
          <Search size={40} color="#9ca3af" />
          <h3>No Matching Candidates Found</h3>
          <p>No hired candidates match your search query or selected filter criteria.</p>
          <button
            className="btn-outline"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("All");
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="card hired-table-card">
          <div className="hired-table-wrap">
            <table className="hired-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Employee ID & Role</th>
                  <th>Salary</th>
                  <th>Dates (Hired / Joined)</th>
                  <th>Status</th>
                  <th>Resume PDF</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => {
                  const empId = emp._id || emp.id;
                  const resumeData = emp.resume;
                  const resumeName =
                    emp.resumeFileName ||
                    `${(emp.candidateName || "Candidate").replace(/\s+/g, "_")}_Resume.pdf`;
                  const statusClass = (emp.status || "Active").toLowerCase().replace(/\s+/g, "-");

                  return (
                    <tr key={empId}>
                      <td>
                        <div className="hired-candidate-cell">
                          <div className="hired-avatar">
                            {(emp.candidateName || "U").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <strong style={{ display: "block", fontSize: 14 }}>
                              {emp.candidateName}
                            </strong>
                            <span
                              style={{
                                color: "var(--cv-muted)",
                                fontSize: 12,
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <Mail size={11} /> {emp.candidateEmail}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          <span className="hired-emp-id">
                            {emp.employeeId || "EMP-N/A"}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>
                            {emp.role || "Role"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: "#047857", fontSize: 13.5 }}>
                          {emp.salary || "Competitive"}
                        </strong>
                      </td>
                      <td>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--cv-muted)",
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          <span>
                            <strong>Hired:</strong>{" "}
                            {emp.hiredDate
                              ? new Date(emp.hiredDate).toLocaleDateString()
                              : "Recently"}
                          </span>
                          {emp.joiningDate && (
                            <span>
                              <strong>Joined:</strong>{" "}
                              {new Date(emp.joiningDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`hired-status-pill ${statusClass}`}>
                          {emp.status || "Active"}
                        </span>
                      </td>
                      <td>
                        {resumeData ? (
                          <button
                            type="button"
                            className="btn-outline"
                            style={{
                              fontSize: 12,
                              padding: "5px 9px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                            }}
                            onClick={() =>
                              handleDownloadResume(
                                resumeData,
                                emp.candidateName,
                                resumeName
                              )
                            }
                            title="Download candidate resume PDF"
                          >
                            <FileText size={13} color="#dc2626" />
                            <span>Resume</span>
                            <Download size={12} />
                          </button>
                        ) : (
                          <span
                            style={{
                              color: "#9ca3af",
                              fontSize: 12,
                              fontStyle: "italic",
                            }}
                          >
                            No file
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--cv-muted)",
                            maxWidth: 160,
                            display: "inline-block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={emp.notes || "No notes added"}
                        >
                          {emp.notes || "—"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <button
                            type="button"
                            className="btn-outline table-btn icon-only"
                            title="Edit Hired Candidate Details"
                            onClick={() => handleOpenEdit(emp)}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn-outline table-btn icon-only"
                            style={{ borderColor: "#ef4444", color: "#ef4444" }}
                            title="Delete from Hired Records"
                            onClick={() => handleDelete(empId)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* EDIT / ADD HIRED CANDIDATE MODAL                   */}
      {/* -------------------------------------------------- */}
      {modalOpen && (
        <div className="cv-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="cv-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="cv-modal-header">
              <div>
                <h2 style={{ margin: 0, fontSize: 19 }}>
                  {editingId ? "Edit Hired Candidate Details" : "Add Hired Candidate"}
                </h2>
                <p style={{ margin: "4px 0 0 0", color: "var(--cv-muted)", fontSize: 13 }}>
                  Update employee ID, role, salary package, employment dates, and onboarding notes.
                </p>
              </div>
              <button
                type="button"
                className="cv-modal-close"
                onClick={() => setModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="post-job-form">
              <div className="form-group-row">
                <div className="form-group" style={{ flex: 1.5 }}>
                  <label>Candidate Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={form.candidateName}
                    onChange={(e) =>
                      setForm({ ...form, candidateName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1.5 }}>
                  <label>Candidate Email *</label>
                  <input
                    type="email"
                    placeholder="e.g. candidate@example.com"
                    value={form.candidateEmail}
                    onChange={(e) =>
                      setForm({ ...form, candidateEmail: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>Employee ID *</label>
                  <input
                    type="text"
                    placeholder="e.g. EMP-1042"
                    value={form.employeeId}
                    onChange={(e) =>
                      setForm({ ...form, employeeId: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hired Role / Designation *</label>
                  <input
                    type="text"
                    placeholder="e.g. Frontend Engineer"
                    value={form.role}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Salary Package</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹12,00,000 / yr"
                    value={form.salary}
                    onChange={(e) =>
                      setForm({ ...form, salary: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>Hired Date</label>
                  <input
                    type="date"
                    value={form.hiredDate}
                    onChange={(e) =>
                      setForm({ ...form, hiredDate: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Joining Date</label>
                  <input
                    type="date"
                    value={form.joiningDate}
                    onChange={(e) =>
                      setForm({ ...form, joiningDate: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Employment Status</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Joined">Joined</option>
                    <option value="Offer Accepted">Offer Accepted</option>
                    <option value="Completed">Completed</option>
                    <option value="Resigned">Resigned</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Internal Notes & Comments</label>
                <textarea
                  rows={3}
                  placeholder="Candidate performance, onboarding schedule, team assignment..."
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                />
              </div>

              <div className="cv-modal-actions">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setModalOpen(false)}
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? "Saving..." : "Save Hired Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HiredEmployees;
