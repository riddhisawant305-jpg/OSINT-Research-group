import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "60px 20px", textAlign: "center", maxWidth: "500px", margin: "40px auto", background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", marginBottom: "10px" }}>Something went wrong</h2>
          <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: 1.6, marginBottom: "24px" }}>
            An unexpected error occurred while rendering this page.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
                background: "#fff",
                cursor: "pointer",
                fontWeight: "600"
              }}
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
            >
              Refresh Page
            </button>
            <button
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "600"
              }}
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = "/home";
              }}
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
