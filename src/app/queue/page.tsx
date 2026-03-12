"use client";

import { useEffect, useState } from "react";

type Draft = {
  id: number;
  tweet_text: string;
  status: string;
};

export default function QueuePage() {
  const [tweets, setTweets] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadQueue() {
    try {
      const res = await fetch("/api/drafts");
      const data = await res.json();
      const approved = (data.drafts || []).filter(
        (d: Draft) => d.status === "approved"
      );
      setTweets(approved);
    } catch {
      setError("Failed to load queue.");
    }
  }

  useEffect(() => {
    loadQueue();
  }, []);

  async function scheduleApprovedTweets() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to schedule tweets.");
        return;
      }

      await loadQueue();
    } catch {
      setError("Failed to schedule tweets.");
    } finally {
      setLoading(false);
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
        setError(data.error || "Failed to delete tweet.");
        return;
      }

      await loadQueue();
    } catch {
      setError("Failed to delete tweet.");
    }
  }

  async function resetQueue() {
    setError("");

    try {
      const res = await fetch("/api/drafts/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scope: "queue" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset queue.");
        return;
      }

      await loadQueue();
    } catch {
      setError("Failed to reset queue.");
    }
  }

  return (
    <div>
      <h1 style={{ marginTop: 0, color: "#111827" }}>Queue</h1>

      <div style={{ marginBottom: 20, display: "flex", gap: 12 }}>
        <button onClick={scheduleApprovedTweets} disabled={loading} style={primaryButton}>
          {loading ? "Scheduling..." : "Schedule Approved Tweets"}
        </button>

        <button onClick={resetQueue} style={dangerSoftButton}>
          Reset Queue
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

      {tweets.length === 0 && (
        <div style={emptyStyle}>No approved tweets waiting in queue.</div>
      )}

      {tweets.map((tweet) => (
        <div key={tweet.id} style={tweetCard}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <p style={{ margin: 0, whiteSpace: "pre-wrap", color: "#111827", flex: 1 }}>
              {tweet.tweet_text}
            </p>

            <button
              onClick={() => deleteDraft(tweet.id)}
              style={binButton}
              title="Delete tweet"
            >
              🗑
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

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