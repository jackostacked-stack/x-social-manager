"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type Draft = {
  id: number;
  tweet_text: string;
  status: string;
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
      (d: Draft) => d.status === "posted"
    );

    setTweets(posted);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const analytics = useMemo(() => {
    const totalViews = tweets.reduce((sum, t) => sum + (t.views || 0), 0);
    const totalLikes = tweets.reduce((sum, t) => sum + (t.likes || 0), 0);
    const totalReposts = tweets.reduce((sum, t) => sum + (t.reposts || 0), 0);
    const totalReplies = tweets.reduce((sum, t) => sum + (t.replies || 0), 0);

    const bestTweet =
      tweets.length > 0
        ? [...tweets].sort((a, b) => (b.views || 0) - (a.views || 0))[0]
        : null;

    const avgEngagement =
      tweets.length === 0
        ? 0
        : Math.round(
            (totalLikes + totalReposts + totalReplies) / tweets.length
          );

    const chartData = [...tweets]
      .reverse()
      .map((tweet, index) => ({
        name: `#${index + 1}`,
        views: tweet.views || 0,
        likes: tweet.likes || 0,
      }));

    return {
      totalViews,
      totalLikes,
      totalReposts,
      totalReplies,
      bestTweet,
      avgEngagement,
      chartData,
    };
  }, [tweets]);

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
            Analytics
          </h1>

          <p
            style={{
              margin: 0,
              color: "#B9B9C8",
              fontSize: 15,
            }}
          >
            Track performance, compare output, and see which tweets are leading the feed.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={emptyStateCard}>Loading analytics...</div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 14,
              marginBottom: 24,
            }}
          >
            <AnalyticsCard label="Total Views" value={analytics.totalViews} />
            <AnalyticsCard label="Total Likes" value={analytics.totalLikes} />
            <AnalyticsCard label="Total Reposts" value={analytics.totalReposts} />
            <AnalyticsCard label="Total Replies" value={analytics.totalReplies} />
            <AnalyticsCard
              label="Average Engagement"
              value={analytics.avgEngagement}
            />
          </div>

          <div style={chartCard}>
            <div style={{ marginBottom: 14 }}>
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: 6,
                  color: "#FCFCFC",
                  fontSize: 22,
                }}
              >
                Views per Tweet
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#B9B9C8",
                  fontSize: 14,
                }}
              >
                Performance trend across your posted tweets.
              </p>
            </div>

            {analytics.chartData.length === 0 ? (
              <div style={{ color: "#787A8D" }}>No chart data yet.</div>
            ) : (
              <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.chartData}>
                    <defs>
                      <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6D8CFF" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#6D8CFF" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid stroke="#22242D" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#787A8D"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#787A8D"
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#18181F",
                        border: "1px solid #22242D",
                        borderRadius: 16,
                        color: "#FCFCFC",
                      }}
                      labelStyle={{ color: "#B9B9C8" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="#6D8CFF"
                      strokeWidth={3}
                      fill="url(#viewsFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {analytics.bestTweet && (
            <div style={bestTweetCard}>
              <div style={{ marginBottom: 10 }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    borderRadius: 9999,
                    background: "rgba(109,140,255,0.12)",
                    border: "1px solid rgba(109,140,255,0.22)",
                    color: "#FCFCFC",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Best Performing Tweet
                </div>
              </div>

              <p
                style={{
                  marginTop: 0,
                  whiteSpace: "pre-wrap",
                  color: "#FCFCFC",
                  lineHeight: 1.6,
                  fontSize: 15,
                }}
              >
                {analytics.bestTweet.tweet_text}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: 12,
                  marginTop: 14,
                }}
              >
                <MiniMetric label="Views" value={analytics.bestTweet.views || 0} />
                <MiniMetric label="Likes" value={analytics.bestTweet.likes || 0} />
                <MiniMetric
                  label="Reposts"
                  value={analytics.bestTweet.reposts || 0}
                />
                <MiniMetric
                  label="Replies"
                  value={analytics.bestTweet.replies || 0}
                />
              </div>
            </div>
          )}

          {tweets.length === 0 && (
            <div style={{ ...emptyStateCard, marginTop: 20 }}>
              No posted tweets yet.
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AnalyticsCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div style={analyticsCard}>
      <div
        style={{
          fontSize: 13,
          color: "#787A8D",
          marginBottom: 8,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 30,
          fontWeight: 700,
          color: "#FCFCFC",
        }}
      >
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
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

const analyticsCard: React.CSSProperties = {
  background: "#18181F",
  border: "1px solid #22242D",
  borderRadius: 20,
  padding: 18,
  boxShadow:
    "0 0 0 1px rgba(255,255,255,0.02), 0 10px 30px rgba(0,0,0,0.22)",
};

const chartCard: React.CSSProperties = {
  background: "#18181F",
  border: "1px solid #22242D",
  borderRadius: 24,
  padding: 20,
  marginBottom: 24,
  boxShadow:
    "0 0 0 1px rgba(255,255,255,0.02), 0 10px 30px rgba(0,0,0,0.22)",
};

const bestTweetCard: React.CSSProperties = {
  background: "#18181F",
  border: "1px solid #22242D",
  borderRadius: 24,
  padding: 20,
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