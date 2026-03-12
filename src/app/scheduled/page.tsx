"use client";

import { useEffect, useState } from "react";

type Draft = {
  id: number;
  tweet_text: string;
  status: string;
  scheduled_for: string | null;
  media_url?: string | null;
  media_type?: string | null;
};

function toBerlinDisplay(dateString: string) {
  return new Date(dateString).toLocaleString("en-GB", {
    timeZone: "Europe/Berlin",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function toBerlinInputValue(dateString: string) {
  const date = new Date(dateString);

  const berlin = new Date(
    date.toLocaleString("en-US", { timeZone: "Europe/Berlin" })
  );

  const year = berlin.getFullYear();
  const month = String(berlin.getMonth() + 1).padStart(2, "0");
  const day = String(berlin.getDate()).padStart(2, "0");
  const hours = String(berlin.getHours()).padStart(2, "0");
  const minutes = String(berlin.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function ScheduledPage() {
  const [tweets, setTweets] = useState<Draft[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedTime, setEditedTime] = useState<Record<number, string>>({});
  const [error, setError] = useState("");

  async function loadScheduled() {
    try {
      const res = await fetch("/api/drafts");
      const data = await res.json();
      const scheduled = (data.drafts || []).filter(
        (d: Draft) => d.status === "scheduled"
      );
      setTweets(scheduled);
    } catch {
      setError("Failed to load scheduled tweets.");
    }
  }

  useEffect(() => {
    loadScheduled();
  }, []);

  async function postNow(id: number) {
    setError("");

    try {
      const res = await fetch("/api/post-now", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ draftId: id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to post tweet now.");
        return;
      }

      await loadScheduled();
    } catch {
      setError("Failed to post tweet now.");
    }
  }

  async function deleteScheduled(id: number) {
    setError("");

    try {
      const res = await fetch("/api/scheduled/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ draftId: id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to delete scheduled tweet.");
        return;
      }

      await loadScheduled();
    } catch {
      setError("Failed to delete scheduled tweet.");
    }
  }

  async function resetScheduled() {
    setError("");

    try {
      const res = await fetch("/api/scheduled/reset", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset scheduled tweets.");
        return;
      }

      await loadScheduled();
    } catch {
      setError("Failed to reset scheduled tweets.");
    }
  }

  function startEditing(tweet: Draft) {
    setEditingId(tweet.id);

    const value = tweet.scheduled_for
      ? toBerlinInputValue(tweet.scheduled_for)
      : "";

    setEditedTime((prev) => ({
      ...prev,
      [tweet.id]: value,
    }));
  }

  function cancelEditing() {
    setEditingId(null);
  }

  async function saveTime(id: number) {
    setError("");

    try {
      const value = editedTime[id];

      if (!value) {
        setError("Please choose a valid date and time.");
        return;
      }

      const res = await fetch("/api/scheduled/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          draftId: id,
          scheduled_for: value,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save scheduled time.");
        return;
      }

      setEditingId(null);
      await loadScheduled();
    } catch {
      setError("Failed to save scheduled time.");
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
            Scheduled
          </h1>

          <p
            style={{
              margin: 0,
              color: "#B9B9C8",
              fontSize: 15,
            }}
          >
            Manage upcoming tweets, adjust posting times, and push live instantly if needed.
          </p>
        </div>

        <button onClick={resetScheduled} style={softDangerButton}>
          Reset Scheduled
        </button>
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
        <div style={emptyStateCard}>No scheduled tweets yet.</div>
      )}

      {tweets.map((tweet) => (
        <div key={tweet.id} style={scheduledCard}>
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
            <div style={{ marginBottom: 14 }}>
              {tweet.media_type === "image" ? (
                <img
                  src={tweet.media_url}
                  alt="Scheduled media"
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

          {editingId === tweet.id ? (
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginBottom: 14,
                flexWrap: "wrap",
              }}
            >
              <input
                type="datetime-local"
                value={editedTime[tweet.id] || ""}
                onChange={(e) =>
                  setEditedTime((prev) => ({
                    ...prev,
                    [tweet.id]: e.target.value,
                  }))
                }
                style={dateInput}
              />

              <button onClick={() => saveTime(tweet.id)} style={brandButton}>
                Save
              </button>

              <button onClick={cancelEditing} style={ghostButton}>
                Cancel
              </button>
            </div>
          ) : (
            <div
              style={{
                marginBottom: 14,
                color: "#B9B9C8",
                fontSize: 14,
              }}
            >
              {tweet.scheduled_for
                ? `${toBerlinDisplay(tweet.scheduled_for)} CET`
                : "No time set"}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => startEditing(tweet)} style={secondaryButton}>
              Edit Time
            </button>

            <button onClick={() => postNow(tweet.id)} style={brandButton}>
              Post Now
            </button>

            <button onClick={() => deleteScheduled(tweet.id)} style={softDangerButton}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const scheduledCard: React.CSSProperties = {
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

const dateInput: React.CSSProperties = {
  maxWidth: 260,
  padding: "12px 14px",
  borderRadius: 16,
  background: "#101114",
  border: "1px solid #22242D",
  color: "#FCFCFC",
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

const secondaryButton: React.CSSProperties = {
  background: "#22242D",
  color: "#FCFCFC",
  border: "1px solid #2d3040",
  borderRadius: 9999,
  padding: "12px 18px",
  cursor: "pointer",
  fontWeight: 600,
};

const ghostButton: React.CSSProperties = {
  background: "transparent",
  color: "#B9B9C8",
  border: "1px solid #22242D",
  borderRadius: 9999,
  padding: "12px 18px",
  cursor: "pointer",
  fontWeight: 600,
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