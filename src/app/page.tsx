"use client";

import { useEffect, useState } from "react";

type Draft = {
  id: number;
  tweet_text: string;
  status: string;
  media_url?: string | null;
  media_type?: string | null;
};

export default function ManagerPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [manualTweet, setManualTweet] = useState("");
  const [manualMedia, setManualMedia] = useState<File | null>(null);
  const [manualMediaPreview, setManualMediaPreview] = useState<string | null>(null);
  const [manualMediaType, setManualMediaType] = useState<string | null>(null);

  async function loadDrafts() {
    try {
      const res = await fetch("/api/drafts");
      const data = await res.json();
      setDrafts(data.drafts || []);
    } catch {
      setError("Failed to load drafts.");
    }
  }

  useEffect(() => {
    loadDrafts();
  }, []);

  async function generateTweets() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate tweets.");
        return;
      }

      await loadDrafts();
    } catch {
      setError("Failed to generate tweets.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: number, status: "approved" | "rejected") {
    setError("");

    try {
      const res = await fetch("/api/drafts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ draftId: id, status }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update draft.");
        return;
      }

      await loadDrafts();
    } catch {
      setError("Failed to update draft.");
    }
  }

  async function deleteDraft(id: number) {
    setError("");

    try {
      const res = await fetch("/api/drafts/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ draftId: id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to delete draft.");
        return;
      }

      await loadDrafts();
    } catch {
      setError("Failed to delete draft.");
    }
  }

  async function resetManager() {
    setError("");

    try {
      const res = await fetch("/api/drafts/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scope: "manager" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset manager.");
        return;
      }

      await loadDrafts();
    } catch {
      setError("Failed to reset manager.");
    }
  }

  async function uploadMedia(draftId: number, file: File) {
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("draftId", String(draftId));

      const res = await fetch("/api/upload-media", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to upload media.");
        return;
      }

      await loadDrafts();
    } catch {
      setError("Failed to upload media.");
    }
  }

  async function createManualDraft() {
    setError("");

    try {
      if (!manualTweet.trim()) {
        setError("Please write a tweet first.");
        return;
      }

      const res = await fetch("/api/manual-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tweet_text: manualTweet,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create draft.");
        return;
      }

      const draftId = data?.draft?.id;

      if (manualMedia && draftId) {
        const formData = new FormData();
        formData.append("file", manualMedia);
        formData.append("draftId", String(draftId));

        const uploadRes = await fetch("/api/upload-media", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          setError(uploadData.error || "Tweet created but media upload failed.");
          await loadDrafts();
          return;
        }
      }

      setManualTweet("");
      setManualMedia(null);
      setManualMediaPreview(null);
      setManualMediaType(null);

      await loadDrafts();
    } catch {
      setError("Failed to create draft.");
    }
  }

  const pending = drafts.filter((d) => d.status === "pending");
  const approved = drafts.filter((d) => d.status === "approved");
  const scheduled = drafts.filter((d) => d.status === "scheduled");
  const posted = drafts.filter((d) => d.status === "posted");

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
            Manager
          </h1>

          <p
            style={{
              margin: 0,
              color: "#B9B9C8",
              fontSize: 15,
            }}
          >
            Generate, compose, edit, and approve tweets before they enter your queue.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={generateTweets} disabled={loading} style={brandButton}>
            {loading ? "Generating..." : "Generate Tweets"}
          </button>

          <button onClick={resetManager} style={softDangerButton}>
            Reset Manager
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <StatCard label="Pending" value={pending.length} />
        <StatCard label="Approved" value={approved.length} />
        <StatCard label="Scheduled" value={scheduled.length} />
        <StatCard label="Posted" value={posted.length} />
      </div>

      <div style={panelCard}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={sectionTitle}>Compose Tweet</h3>
          <p style={sectionSubtitle}>
            Write a custom tweet manually and send it straight to the queue.
          </p>
        </div>

        <textarea
          value={manualTweet}
          onChange={(e) => setManualTweet(e.target.value)}
          placeholder="Write a tweet..."
          style={darkTextarea}
        />

        <div style={{ marginBottom: 14 }}>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setManualMedia(file);

              if (file) {
                const previewUrl = URL.createObjectURL(file);
                setManualMediaPreview(previewUrl);
                setManualMediaType(file.type.startsWith("video") ? "video" : "image");
              } else {
                setManualMediaPreview(null);
                setManualMediaType(null);
              }
            }}
            style={fileInput}
          />

          {manualMediaPreview && (
            <div style={{ marginTop: 12 }}>
              {manualMediaType === "image" ? (
                <img
                  src={manualMediaPreview}
                  alt="Manual tweet media preview"
                  style={mediaPreview}
                />
              ) : (
                <video
                  src={manualMediaPreview}
                  controls
                  style={mediaPreview}
                />
              )}
            </div>
          )}
        </div>

        <button onClick={createManualDraft} style={brandButton}>
          Add to Queue
        </button>
      </div>

      {error && (
        <div
          style={{
            marginTop: 18,
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

      <div style={{ marginTop: 26, marginBottom: 14 }}>
        <h2 style={sectionTitle}>Draft Review</h2>
        <p style={sectionSubtitle}>
          Refine generated tweets, attach media, and approve only the strongest ones.
        </p>
      </div>

      {pending.length === 0 && (
        <div style={emptyStateCard}>No drafts waiting for review.</div>
      )}

      {pending.map((draft) => (
        <div key={draft.id} style={draftCard}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 14,
            }}
          >
            <div style={{ flex: 1 }}>
              <textarea
                value={draft.tweet_text}
                onChange={(e) => {
                  const newText = e.target.value;

                  setDrafts((prev) =>
                    prev.map((d) =>
                      d.id === draft.id ? { ...d, tweet_text: newText } : d
                    )
                  );
                }}
                style={darkTextarea}
              />

              <div style={{ marginBottom: 14 }}>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      uploadMedia(draft.id, file);
                    }
                  }}
                  style={fileInput}
                />

                {draft.media_url && (
                  <div style={{ marginTop: 12 }}>
                    {draft.media_type === "image" ? (
                      <img
                        src={draft.media_url}
                        alt="Tweet media"
                        style={mediaPreview}
                      />
                    ) : (
                      <video
                        src={draft.media_url}
                        controls
                        style={mediaPreview}
                      />
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={async () => {
                    await fetch("/api/update-draft", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        draftId: draft.id,
                        tweet_text: draft.tweet_text,
                      }),
                    });

                    await loadDrafts();
                  }}
                  style={secondaryButton}
                >
                  Save
                </button>

                <button
                  onClick={() => updateStatus(draft.id, "approved")}
                  style={brandButton}
                >
                  Approve
                </button>

                <button
                  onClick={() => updateStatus(draft.id, "rejected")}
                  style={ghostButton}
                >
                  Reject
                </button>
              </div>
            </div>

            <button
              onClick={() => deleteDraft(draft.id)}
              style={deleteIconButton}
              title="Delete tweet"
            >
              🗑
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        background: "#18181F",
        border: "1px solid #22242D",
        borderRadius: 20,
        padding: 18,
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.02), 0 10px 30px rgba(0,0,0,0.22)",
      }}
    >
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
        {value}
      </div>
    </div>
  );
}

const panelCard: React.CSSProperties = {
  background: "#18181F",
  border: "1px solid #22242D",
  borderRadius: 20,
  padding: 20,
  boxShadow:
    "0 0 0 1px rgba(255,255,255,0.02), 0 10px 30px rgba(0,0,0,0.22)",
};

const draftCard: React.CSSProperties = {
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

const sectionTitle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 6,
  color: "#FCFCFC",
  fontSize: 22,
};

const sectionSubtitle: React.CSSProperties = {
  margin: 0,
  color: "#B9B9C8",
  fontSize: 14,
  lineHeight: 1.5,
};

const darkTextarea: React.CSSProperties = {
  width: "100%",
  minHeight: 110,
  padding: 14,
  borderRadius: 18,
  border: "1px solid #22242D",
  background: "#101114",
  color: "#FCFCFC",
  marginBottom: 14,
  resize: "vertical",
};

const fileInput: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 16,
  background: "#101114",
  border: "1px solid #22242D",
  color: "#B9B9C8",
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

const deleteIconButton: React.CSSProperties = {
  background: "rgba(175,18,60,0.16)",
  color: "#FCFCFC",
  border: "1px solid rgba(175,18,60,0.3)",
  borderRadius: 18,
  width: 46,
  height: 46,
  cursor: "pointer",
  flexShrink: 0,
};