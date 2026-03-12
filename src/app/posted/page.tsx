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
  media_url?: string | null;
  media_type?: string | null;
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
            Posted
          </h1>

          <p
            style={{
              margin: 0,
              color: "#B9B9C8",
              fontSize: 15,
            }}
          >
            Review tweets that have gone live and monitor how each one performed.
          </p>
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
        <div style={emptyStateCard}>No posted tweets yet.</div>
      )}

      {tweets.map((tweet) => (
        <div key={tweet.id} style={postedCard}>
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
                  alt="Posted media"
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

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 12,
              marginTop: 10,
            }}
          >
            <MetricPill label="Views" value={tweet.views || 0} />
            <MetricPill label="Likes" value={tweet.likes || 0} />
            <MetricPill label="Reposts" value={tweet.reposts || 0} />
            <MetricPill label="Replies" value={tweet.replies || 0} />
          </div>

          <div
            style={{
              marginTop: 14,
              color: "#787A8D",
              fontSize: 13,
            }}
          >
            Tweet ID: {tweet.tweet_id || "—"}
          </div>
        </div>
      ))}
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        background: "#101114",
        border: "1px solid #22242D",
        borderRadius: 18,
        padding: "12px 14px",
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "#787A8D",
          marginBottom: 6,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: "#FCFCFC",
        }}
      >
        {value.toLocaleString()}
      </div>
    </div>
  );
}

const postedCard: React.CSSProperties = {
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