"use client";

import { useEffect, useState } from "react";

type Draft = {
  id: number;
  tweet_text: string;
  status: string;
  media_url?: string | null;
  media_type?: string | null;
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
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              marginTop: 0,
              marginBottom: 8,
              color: "#FCFCFC",
              fontSize: 34,
              lineHeight: 1.05,
            }}
          >
            Queue
          </h1>

          <p
            style={{
              margin: 0,
              color: "#B9B9C8",
              fontSize: 15,
            }}
          >
            Review approved tweets waiting to be scheduled and sent live.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={scheduleApprovedTweets}
            disabled={loading}
            style={brandButton}
          >
            {loading ? "Scheduling..." : "Schedule Approved Tweets"}
          </button>

          <button onClick={resetQueue} style={softDangerButton}>
            Reset Queue
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 18,
            padding: 14,
            borderRadius: 18,
            background: "rgba(175,18,60,0.14)",
            border: "1px solid rgba(175,18,60,0.35)",
            color: "#FCFCFC",
          }}
        >
          {error}
        </div>
      )}

      {tweets.length === 0 && (
        <div style={emptyStateCard}>No approved tweets waiting in queue.</div>
      )}

      {tweets.map((tweet) => (
        <div key={tweet.id} style={queueCard}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 14,
            }}
          >
            <div style={{ flex: 1 }}>
              <p
                style={{
                  marginTop: 0,
                  marginBottom: 14,
                  whiteSpace: "pre-wrap",
                  color: "#FCFCFC",
                  lineHeight: 1.55,
                }}
              >
                {tweet.tweet_text}
              </p>

              {tweet.media_url && (
                <div style={{ marginBottom: 10 }}>
                  {tweet.media_type === "image" ? (
                    <img
                      src={tweet.media_url}
                      alt="Queue media"
                      style={mediaPreview}
                    />
                  ) : (
                    <video
                      src={tweet.media_url}
                      controls
                      style={mediaPreview}
                    />
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => deleteDraft(tweet.id)}
              style={deleteIconButton}
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

const queueCard: React.CSSProperties = {
  background: "#18181F",
  border: "1px solid #22242D",
  borderRadius: 20,
  padding: 18,
  marginBottom: 14,
  boxShadow:
    "0 0 0 1px rgba(255,255,255,0.02), 0 10px 30px rgba(0,0,0,0.22)",
};

const emptyStateCard: React.CSSProperties = {
  background: "#18181F",
  border: "1px solid #22242D",
  borderRadius: 20,
  padding: 18,
  color: "#787A8D",
};

const mediaPreview: React.CSSProperties = {
  maxWidth: 240,
  borderRadius: 18,
  border: "1px solid #22242D",
};

const brandButton: React.CSSProperties = {
  background: "#6D8CFF",
  color: "#FCFCFC",
  border: "none",
  borderRadius: 9999,
  padding: "12px 18px",
  cursor: "pointer",
  fontWeight: 700,
  boxShadow: "0 10px 30px rgba(109,140,255,0.18)",
};

const softDangerButton: React.CSSProperties = {
  background: "rgba(175,18,60,0.12)",
  color: "#FCFCFC",
  border: "1px solid rgba(175,18,60,0.3)",
  borderRadius: 9999,
  padding: "12px 18px",
  cursor: "pointer",
  fontWeight: 600,
};

const deleteIconButton: React.CSSProperties = {
  background: "rgba(175,18,60,0.16)",
  color: "#FCFCFC",
  border: "1px solid rgba(175,18,60,0.3)",
  borderRadius: 18,
  width: 46,
  height: 46,
  cursor: "pointer",
  flexShrink: 0,
};