"use client";

import { useEffect, useState } from "react";

type Draft = {
  id: number;
  tweet_text: string;
  status: string;
};

export default function ManagerPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadDrafts() {
    try {
      const res = await fetch("/api/drafts");
      const data = await res.json();
      setDrafts(data.drafts || []);
    } catch {
      setError("Failed to load drafts.");
    }
  }

  useEffect(() => {
    loadDrafts();
  }, []);

  async function generateTweets() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate tweets.");
        return;
      }

      await loadDrafts();
    } catch {
      setError("Failed to generate tweets.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: number, status: "approved" | "rejected") {
    setError("");

    try {
      const res = await fetch("/api/drafts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ draftId: id, status }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update draft.");
        return;
      }

      await loadDrafts();
    } catch {
      setError("Failed to update draft.");
    }
  }

  async function deleteDraft(id: number) {
    setError("");

    try {
      const res = await fetch("/api/drafts/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ draftId: id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to delete draft.");
        return;
      }

      await loadDrafts();
    } catch {
      setError("Failed to delete draft.");
    }
  }

  async function resetManager() {
    setError("");

    try {
      const res = await fetch("/api/drafts/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scope: "manager" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset manager.");
        return;
      }

      await loadDrafts();
    } catch {
      setError("Failed to reset manager.");
    }
  }

  const pending = drafts.filter((d) => d.status === "pending");
  const approved = drafts.filter((d) => d.status === "approved");
  const scheduled = drafts.filter((d) => d.status === "scheduled");
  const posted = drafts.filter((d) => d.status === "posted");

  return (
    <div>
      <h1 style={{ marginTop: 0, color: "#111827" }}>Manager</h1>

      <div
  style={{
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
  }}
>
  <h3 style={{ marginTop: 0 }}>Compose Tweet</h3>

  <textarea
    id="manualTweet"
    placeholder="Write a tweet..."
    style={{
      width: "100%",
      minHeight: 100,
      padding: 12,
      borderRadius: 8,
      border: "1px solid #d1d5db",
      marginBottom: 12,
      resize: "vertical",
    }}
  />

  <button
    onClick={async () => {
      const text = (
        document.getElementById("manualTweet") as HTMLTextAreaElement
      ).value;

      if (!text) return;

      await fetch("/api/manual-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tweet_text: text,
        }),
      });

      location.reload();
    }}
    style={{
      background: "#111827",
      color: "#fff",
      border: "none",
      padding: "10px 16px",
      borderRadius: 8,
      cursor: "pointer",
    }}
  >
    Add to Queue
  </button>
</div>
<div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div style={cardStyle}>
          <div style={labelStyle}>Pending</div>
          <div style={valueStyle}>{pending.length}</div>
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Approved</div>
          <div style={valueStyle}>{approved.length}</div>
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Scheduled</div>
          <div style={valueStyle}>{scheduled.length}</div>
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Posted</div>
          <div style={valueStyle}>{posted.length}</div>
        </div>
      </div>

      <div style={{ marginBottom: 24, display: "flex", gap: 12 }}>
        <button onClick={generateTweets} disabled={loading} style={primaryButton}>
          {loading ? "Generating..." : "Generate Tweets"}
        </button>

        <button onClick={resetManager} style={dangerSoftButton}>
          Reset Manager
        </button>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 20,
            padding: 12,
            borderRadius: 8,
            background: "#fee2e2",
            color: "#991b1b",
          }}
        >
          {error}
        </div>
      )}

      <h2 style={{ color: "#111827" }}>Draft Review</h2>

      {pending.length === 0 && (
        <div style={emptyStyle}>No drafts waiting for review.</div>
      )}

      {pending.map((draft) => (
        <div key={draft.id} style={tweetCard}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <p style={{ marginTop: 0, marginBottom: 16, whiteSpace: "pre-wrap", color: "#111827", flex: 1 }}>
              {draft.tweet_text}
            </p>

            <button
              onClick={() => deleteDraft(draft.id)}
              style={binButton}
              title="Delete tweet"
            >
              🗑
            </button>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => updateStatus(draft.id, "approved")}
              style={primaryButton}
            >
              Approve
            </button>

            <button
              onClick={() => updateStatus(draft.id, "rejected")}
              style={secondaryButton}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 16,
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#6b7280",
  marginBottom: 8,
};

const valueStyle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  color: "#111827",
};

const tweetCard: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 16,
  marginBottom: 14,
};

const primaryButton: React.CSSProperties = {
  background: "#111827",
  color: "#ffffff",
  border: "none",
  borderRadius: 8,
  padding: "10px 14px",
  cursor: "pointer",
};

const secondaryButton: React.CSSProperties = {
  background: "#e5e7eb",
  color: "#111827",
  border: "none",
  borderRadius: 8,
  padding: "10px 14px",
  cursor: "pointer",
};

const dangerSoftButton: React.CSSProperties = {
  background: "#fee2e2",
  color: "#991b1b",
  border: "none",
  borderRadius: 8,
  padding: "10px 14px",
  cursor: "pointer",
};

const binButton: React.CSSProperties = {
  background: "#dc2626",
  color: "#ffffff",
  border: "none",
  borderRadius: 8,
  width: 40,
  height: 40,
  cursor: "pointer",
  flexShrink: 0,
};

const emptyStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 16,
  color: "#6b7280",
};