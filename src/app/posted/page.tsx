"use client";

import { useEffect, useState } from "react";

type Draft = {
  id: number;
  tweet_text: string;
  status: string;
  scheduled_for?: string | null;
};

export default function ScheduledPage() {
  const [tweets, setTweets] = useState<Draft[]>([]);

  async function loadScheduled() {
    const res = await fetch("/api/drafts");
    const data = await res.json();
    const scheduled = (data.drafts || []).filter(
      (d: Draft) => d.status === "scheduled"
    );
    setTweets(scheduled);
  }

  useEffect(() => {
    loadScheduled();
  }, []);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Scheduled</h1>

      {tweets.length === 0 && (
        <div style={emptyStyle}>No scheduled tweets yet.</div>
      )}

      {tweets.map((tweet) => (
        <div key={tweet.id} style={tweetCard}>
          <p style={{ marginTop: 0, whiteSpace: "pre-wrap" }}>{tweet.tweet_text}</p>
          <small style={{ color: "#6b7280" }}>
            {tweet.scheduled_for || "No time set"}
          </small>
        </div>
      ))}
    </div>
  );
}

const tweetCard: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 16,
  marginBottom: 14,
};

const emptyStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 16,
  color: "#6b7280",
};