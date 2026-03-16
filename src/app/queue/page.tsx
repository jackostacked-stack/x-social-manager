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
  const [selectedTweets, setSelectedTweets] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [minDelay, setMinDelay] = useState(35);
  const [maxDelay, setMaxDelay] = useState(55);

  const [startTime, setStartTime] = useState("");

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

  async function loadPreset() {
    try {
      const res = await fetch("/api/scheduler-settings");
      const data = await res.json();

      if (data.settings) {
        setMinDelay(data.settings.min_delay_minutes);
        setMaxDelay(data.settings.max_delay_minutes);
      }
    } catch {}
  }

  async function savePreset() {
    await fetch("/api/scheduler-settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        min_delay: minDelay,
        max_delay: maxDelay,
      }),
    });
  }

  useEffect(() => {
    loadQueue();
    loadPreset();
  }, []);

  function toggleTweet(id: number) {
    if (selectedTweets.includes(id)) {
      setSelectedTweets(selectedTweets.filter((t) => t !== id));
    } else {
      setSelectedTweets([...selectedTweets, id]);
    }
  }

  function selectAll() {
    if (selectedTweets.length === tweets.length) {
      setSelectedTweets([]);
    } else {
      setSelectedTweets(tweets.map((t) => t.id));
    }
  }

  async function scheduleSelectedTweets() {
    if (!startTime) {
      setError("Please select a start time.");
      return;
    }

    if (selectedTweets.length === 0) {
      setError("Select tweets to schedule.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tweet_ids: selectedTweets,
          start_time: startTime,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Scheduling failed.");
        return;
      }

      setSelectedTweets([]);
      setStartTime("");

      await loadQueue();
    } catch {
      setError("Failed to schedule tweets.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteDraft(id: number) {
    try {
      await fetch("/api/drafts/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ draftId: id }),
      });

      await loadQueue();
    } catch {}
  }

  async function resetQueue() {
    try {
      await fetch("/api/drafts/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scope: "queue" }),
      });

      await loadQueue();
    } catch {}
  }

  return (
    <div>
      <h1 style={{ color: "#FCFCFC", marginTop: 0 }}>Queue</h1>

      {/* Scheduling preset */}

      <div style={presetCard}>
        <h3 style={{ marginTop: 0, color: "#FCFCFC" }}>Scheduling Preset</h3>

        <div style={{ display: "flex", gap: 16 }}>
          <div>
            <label style={label}>Min Delay</label>
            <input
              type="number"
              value={minDelay}
              onChange={(e) => setMinDelay(Number(e.target.value))}
              style={input}
            />
          </div>

          <div>
            <label style={label}>Max Delay</label>
            <input
              type="number"
              value={maxDelay}
              onChange={(e) => setMaxDelay(Number(e.target.value))}
              style={input}
            />
          </div>

          <button onClick={savePreset} style={brandButton}>
            Save Preset
          </button>
        </div>
      </div>

      {/* Scheduler */}

      <div style={presetCard}>
        <h3 style={{ marginTop: 0, color: "#FCFCFC" }}>
          Schedule Selected Tweets
        </h3>

        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            style={input}
          />

          <button
            onClick={scheduleSelectedTweets}
            disabled={loading}
            style={brandButton}
          >
            {loading ? "Scheduling..." : "Schedule"}
          </button>

          <button onClick={selectAll} style={softButton}>
            Select All
          </button>

          <button onClick={resetQueue} style={softDangerButton}>
            Reset Queue
          </button>
        </div>
      </div>

      {error && <div style={errorBox}>{error}</div>}

      {tweets.map((tweet) => (
        <div key={tweet.id} style={queueCard}>
          <div style={{ display: "flex", gap: 12 }}>
            <input
              type="checkbox"
              checked={selectedTweets.includes(tweet.id)}
              onChange={() => toggleTweet(tweet.id)}
            />

            <div style={{ flex: 1 }}>
              <p style={tweetText}>{tweet.tweet_text}</p>

              {tweet.media_url && (
                <div>
                  {tweet.media_type === "image" ? (
                    <img src={tweet.media_url} style={mediaPreview} />
                  ) : (
                    <video src={tweet.media_url} controls style={mediaPreview} />
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => deleteDraft(tweet.id)}
              style={deleteIconButton}
            >
              🗑
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const presetCard: React.CSSProperties = {
  background: "#18181F",
  border: "1px solid #22242D",
  borderRadius: 20,
  padding: 20,
  marginBottom: 20,
};

const queueCard: React.CSSProperties = {
  background: "#18181F",
  border: "1px solid #22242D",
  borderRadius: 20,
  padding: 18,
  marginBottom: 14,
};

const input: React.CSSProperties = {
  padding: 10,
  borderRadius: 10,
  border: "1px solid #2A2D38",
  background: "#101114",
  color: "#FCFCFC",
};

const label: React.CSSProperties = {
  color: "#787A8D",
  fontSize: 13,
};

const tweetText: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 12,
  whiteSpace: "pre-wrap",
  color: "#FCFCFC",
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
  padding: "10px 18px",
  cursor: "pointer",
  fontWeight: 700,
};

const softButton: React.CSSProperties = {
  background: "#22242D",
  color: "#FCFCFC",
  border: "none",
  borderRadius: 9999,
  padding: "10px 18px",
  cursor: "pointer",
};

const softDangerButton: React.CSSProperties = {
  background: "rgba(175,18,60,0.12)",
  color: "#FCFCFC",
  border: "1px solid rgba(175,18,60,0.3)",
  borderRadius: 9999,
  padding: "10px 18px",
  cursor: "pointer",
};

const deleteIconButton: React.CSSProperties = {
  background: "rgba(175,18,60,0.16)",
  color: "#FCFCFC",
  border: "1px solid rgba(175,18,60,0.3)",
  borderRadius: 18,
  width: 42,
  height: 42,
  cursor: "pointer",
};

const errorBox: React.CSSProperties = {
  marginBottom: 20,
  padding: 14,
  borderRadius: 14,
  background: "rgba(175,18,60,0.14)",
  border: "1px solid rgba(175,18,60,0.35)",
  color: "#FCFCFC",
};