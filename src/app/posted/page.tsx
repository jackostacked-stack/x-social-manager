"use client";

import { useEffect, useState } from "react";

type Draft = {
  id: number;
  tweet_text: string;
  status: string;
  tweet_id?: string | null;
  views?: number;
  likes?: number;
  reposts?: number;
  replies?: number;
};

export default function PostedPage() {
  const [tweets, setTweets] = useState<Draft[]>([]);
  const [error, setError] = useState("");

  async function loadPosted() {
    try {
      const res = await fetch("/api/drafts");
      const data = await res.json();

      const posted = (data.drafts || []).filter(
        (d: Draft) => d.status === "posted"
      );

      setTweets(posted);
    } catch {
      setError("Failed to load posted tweets.");
    }
  }

  useEffect(() => {
    loadPosted();
  }, []);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Posted</h1>

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
          No posted tweets yet.
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

          <div
            style={{
              display: "flex",
              gap: 20,
              flexWrap: "wrap",
              color: "#6b7280",
              marginTop: 10,
            }}
          >
            <span>Views: {tweet.views || 0}</span>
            <span>Likes: {tweet.likes || 0}</span>
            <span>Reposts: {tweet.reposts || 0}</span>
            <span>Replies: {tweet.replies || 0}</span>
          </div>
        </div>
      ))}
    </div>
  );
}