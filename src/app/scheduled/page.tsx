"use client";

import { useEffect, useState } from "react";

export default function ScheduledPage() {
  const [tweets, setTweets] = useState<any[]>([]);

  async function load() {
    const res = await fetch("/api/drafts");
    const data = await res.json();

    setTweets(data.drafts.filter((x: any) => x.status === "scheduled"));
  }

  useEffect(() => {
    load();
  }, []);

  async function postNow(id: number) {
    await fetch("/api/post-now", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ draftId: id }),
    });

    load();
  }

  async function updateTime(id: number, value: string) {
    await fetch("/api/update-schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        draftId: id,
        scheduled_for: value,
      }),
    });
  }

  return (
    <div>
      <h1>Scheduled Tweets</h1>

      {tweets.map((t) => (
        <div key={t.id} style={{ marginBottom: 20 }}>
          <p>{t.tweet_text}</p>

          <input
            type="datetime-local"
            defaultValue={t.scheduled_for?.slice(0, 16)}
            onChange={(e) => updateTime(t.id, e.target.value)}
          />

          <button
            style={{ marginLeft: 10 }}
            onClick={() => postNow(t.id)}
          >
            Post Now
          </button>
        </div>
      ))}
    </div>
  );
}