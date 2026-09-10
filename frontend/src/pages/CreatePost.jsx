import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Image, Video, FileText, X } from "lucide-react";
import { currentUser as fallbackUser } from "../data/dummyData";
import { useAuth } from "../context/AuthContext";
import API from "../api/client";
import Avatar from "../component/Avatar";
import "./CreatePost.css";

function CreatePost() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const activeUser = user || fallbackUser;

  const [text, setText] = useState("");
  const [privacy, setPrivacy] = useState("Anyone");
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); // { file, type, previewUrl, name, size }

  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const docInputRef = useRef(null);

  const handleFileChange = (e, fileType) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // 50MB maximum check
    if (file.size > 50 * 1024 * 1024) {
      alert("File size exceeds 50MB limit");
      return;
    }

    const previewUrl = fileType === "image" || fileType === "video" ? URL.createObjectURL(file) : "";
    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    setSelectedFile({
      file,
      type: fileType,
      previewUrl,
      name: file.name,
      size: sizeStr,
    });

    // Reset input value so same file can be re-selected if removed
    e.target.value = "";
  };

  const removeSelectedFile = () => {
    if (selectedFile?.previewUrl) {
      URL.revokeObjectURL(selectedFile.previewUrl);
    }
    setSelectedFile(null);
  };

  const publish = async () => {
    const hasContent = text.trim().length > 0;
    const hasMedia = !!selectedFile;
    if ((!hasContent && !hasMedia) || submitting) return;

    setSubmitting(true);
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append("content", text.trim());
        formData.append("privacy", privacy);
        formData.append("mediaFile", selectedFile.file);
        formData.append("mediaType", selectedFile.type);
        formData.append("mediaName", selectedFile.name);

        await API.post("/posts", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await API.post("/posts", { content: text.trim(), privacy });
      }
      navigate("/home");
    } catch (err) {
      console.warn("Could not post to backend:", err.message);
      alert("Failed to publish post: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = (text.trim().length > 0 || selectedFile) && !submitting;

  return (
    <div className="create-post-page">
      <div className="card create-post-card">
        <div className="create-post-head">
          <h2>Create a post</h2>
          <button className="icon-btn" onClick={() => navigate("/home")} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="create-post-user">
          <Avatar user={activeUser} size={46} />
          <div>
            <strong>{activeUser.name}</strong>
            <button
              className="privacy-btn"
              onClick={() =>
                setPrivacy((p) => (p === "Anyone" ? "Connections" : p === "Connections" ? "Only Me" : "Anyone"))
              }
            >{privacy} ▾</button>
          </div>
        </div>

        <textarea
          className="create-post-textarea"
          placeholder="What do you want to talk about?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
        />

        {/* Selected Media Preview Area */}
        {selectedFile && (
          <div className="selected-media-preview card">
            <div className="preview-top-bar">
              <span className="preview-badge">
                {selectedFile.type.toUpperCase()} ATTACHMENT
              </span>
              <button
                type="button"
                className="remove-media-btn"
                onClick={removeSelectedFile}
                title="Remove attachment"
              >
                <X size={16} />
              </button>
            </div>

            {selectedFile.type === "image" && (
              <img
                src={selectedFile.previewUrl}
                alt="Upload preview"
                className="preview-image"
              />
            )}

            {selectedFile.type === "video" && (
              <video
                src={selectedFile.previewUrl}
                controls
                className="preview-video"
              />
            )}

            {selectedFile.type === "document" && (
              <div className="preview-doc-box">
                <FileText size={32} color="#dc2626" />
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <strong className="preview-doc-name">{selectedFile.name}</strong>
                  <span className="preview-doc-size">{selectedFile.size}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={photoInputRef}
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => handleFileChange(e, "image")}
        />
        <input
          type="file"
          ref={videoInputRef}
          accept="video/*"
          style={{ display: "none" }}
          onChange={(e) => handleFileChange(e, "video")}
        />
        <input
          type="file"
          ref={docInputRef}
          accept=".pdf,.doc,.docx,.txt"
          style={{ display: "none" }}
          onChange={(e) => handleFileChange(e, "document")}
        />

        <div className="create-post-attach">
          <button
            type="button"
            className={selectedFile?.type === "image" ? "active-attach" : ""}
            onClick={() => photoInputRef.current?.click()}
          >
            <Image size={20} color="#2563eb" />
            <span>Photo</span>
          </button>

          <button
            type="button"
            className={selectedFile?.type === "video" ? "active-attach" : ""}
            onClick={() => videoInputRef.current?.click()}
          >
            <Video size={20} color="#16a34a" />
            <span>Video</span>
          </button>

          <button
            type="button"
            className={selectedFile?.type === "document" ? "active-attach" : ""}
            onClick={() => docInputRef.current?.click()}
          >
            <FileText size={20} color="#dc2626" />
            <span>Add document</span>
          </button>
        </div>

        <div className="create-post-footer">
          <span className="char-count">{text.length} / 3000</span>
          <button className="btn-primary" onClick={publish} disabled={!canSubmit}>
            {submitting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreatePost;
