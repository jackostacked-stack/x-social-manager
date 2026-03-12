"use client";

import { useEffect, useState } from "react";

type Draft = {
  id: number;
  tweet_text: string;
  views?: number;
  likes?: number;
  reposts?: number;
  replies?: number;
};

export default function AnalyticsPage() {
  const [tweets, setTweets] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const res = await fetch("/api/drafts");
    const data = await res.json();

    const posted = (data.drafts || []).filter(
      (d: any) => d.status === "posted"
    );

    setTweets(posted);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <p>Loading analytics...</p>;
  }

  const totalViews = tweets.reduce((sum, t) => sum + (t.views || 0), 0);
  const totalLikes = tweets.reduce((sum, t) => sum + (t.likes || 0), 0);
  const totalReposts = tweets.reduce((sum, t) => sum + (t.reposts || 0), 0);
  const totalReplies = tweets.reduce((sum, t) => sum + (t.replies || 0), 0);

  const bestTweet =
    tweets.sort((a, b) => (b.views || 0) - (a.views || 0))[0];

  const avgEngagement =
    tweets.length === 0
      ? 0
      : Math.round(
          (totalLikes + totalReplies + totalReposts) / tweets.length
        );

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Analytics</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
          gap: 20,
          marginTop: 20,
        }}
      >
        <Card title="Total Views" value={totalViews} />
        <Card title="Total Likes" value={totalLikes} />
        <Card title="Total Reposts" value={totalReposts} />
        <Card title="Total Replies" value={totalReplies} />
        <Card title="Average Engagement" value={avgEngagement} />
      </div>

      {bestTweet && (
        <div
          style={{
            marginTop: 40,
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Best Performing Tweet</h2>

          <p style={{ whiteSpace: "pre-wrap", color: "#111827" }}>
            {bestTweet.tweet_text}
          </p>

          <div
            style={{
              display: "flex",
              gap: 20,
              marginTop: 10,
              color: "#6b7280",
            }}
          >
            <span>Views: {bestTweet.views || 0}</span>
            <span>Likes: {bestTweet.likes || 0}</span>
            <span>Reposts: {bestTweet.reposts || 0}</span>
            <span>Replies: {bestTweet.replies || 0}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 20,
      }}
    >
      <div style={{ color: "#6b7280", marginBottom: 6 }}>{title}</div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#111827",
        }}
      >
        {value.toLocaleString()}
      </div>
    </div>
  );
}