"use client";

import { useEffect, useState } from "react";

type Draft = {
  id: number;
  tweet_text: string;
  status: string;
  scheduled_for: string | null;
};

function toLocalDatetimeValue(dateString: string) {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

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
      ? toLocalDatetimeValue(tweet.scheduled_for)
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
      <h1 style={{ marginTop: 0 }}>Scheduled Tweets</h1>

      <div style={{ marginBottom: 20 }}>
        <button
          onClick={resetScheduled}
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            border: "none",
            borderRadius: 8,
            padding: "10px 14px",
            cursor: "pointer",
          }}
        >
          Reset Scheduled
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
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 16,
            color: "#6b7280",
          }}
        >
          No scheduled tweets yet.
        </div>
      )}

      {tweets.map((tweet) => (
        <div
          key={tweet.id}
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 16,
            marginBottom: 14,
          }}
        >
          <p style={{ marginTop: 0, whiteSpace: "pre-wrap", color: "#111827" }}>
            {tweet.tweet_text}
          </p>

          {editingId === tweet.id ? (
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginBottom: 12,
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
              />

              <button
                onClick={() => saveTime(tweet.id)}
                style={{
                  background: "#111827",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 14px",
                  cursor: "pointer",
                }}
              >
                Save
              </button>

              <button
                onClick={cancelEditing}
                style={{
                  background: "#e5e7eb",
                  color: "#111827",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 14px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: 12, color: "#6b7280" }}>
              {tweet.scheduled_for
                ? new Date(tweet.scheduled_for).toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "No time set"}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => startEditing(tweet)}
              style={{
                background: "#e5e7eb",
                color: "#111827",
                border: "none",
                borderRadius: 8,
                padding: "10px 14px",
                cursor: "pointer",
              }}
            >
              Edit Time
            </button>

            <button
              onClick={() => postNow(tweet.id)}
              style={{
                background: "#111827",
                color: "#ffffff",
                border: "none",
                borderRadius: 8,
                padding: "10px 14px",
                cursor: "pointer",
              }}
            >
              Post Now
            </button>

            <button
              onClick={() => deleteScheduled(tweet.id)}
              style={{
                background: "#dc2626",
                color: "#ffffff",
                border: "none",
                borderRadius: 8,
                padding: "10px 14px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}