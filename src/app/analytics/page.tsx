"use client";

import { useEffect, useMemo, useState } from "react";

type Draft = {
  id: number;
  status: string;
  likes?: number;
  reposts?: number;
  replies?: number;
};

export default function AnalyticsPage() {
  const [tweets, setTweets] = useState<Draft[]>([]);

  async function loadAnalytics() {
    const res = await fetch("/api/drafts");
    const data = await res.json();
    const posted = (data.drafts || []).filter(
      (d: Draft) => d.status === "posted"
    );
    setTweets(posted);
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  const totals = useMemo(() => {
    return {
      tweets: tweets.length,
      likes: tweets.reduce((sum, t) => sum + (t.likes || 0), 0),
      reposts: tweets.reduce((sum, t) => sum + (t.reposts || 0), 0),
      replies: tweets.reduce((sum, t) => sum + (t.replies || 0), 0),
    };
  }, [tweets]);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Analytics</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 16,
        }}
      >
        <div style={cardStyle}>
          <div style={labelStyle}>Posted Tweets</div>
          <div style={valueStyle}>{totals.tweets}</div>
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Total Likes</div>
          <div style={valueStyle}>{totals.likes}</div>
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Total Reposts</div>
          <div style={valueStyle}>{totals.reposts}</div>
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Total Replies</div>
          <div style={valueStyle}>{totals.replies}</div>
        </div>
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#fff",
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
};