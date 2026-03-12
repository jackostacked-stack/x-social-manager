"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseBrowser";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f7f8",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 24,
          boxSizing: "border-box",
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: 8, color: "#111827" }}>
          Tweetflow Login
        </h1>

        <p style={{ marginTop: 0, marginBottom: 20, color: "#6b7280" }}>
          Sign in to access your dashboard.
        </p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: "block",
                marginBottom: 6,
                color: "#111827",
                fontWeight: 600,
              }}
            >
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid #d1d5db",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                display: "block",
                marginBottom: 6,
                color: "#111827",
                fontWeight: 600,
              }}
            >
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid #d1d5db",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                marginBottom: 14,
                padding: 12,
                borderRadius: 10,
                background: "#fee2e2",
                color: "#991b1b",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: "#111827",
              color: "#ffffff",
              border: "none",
              borderRadius: 10,
              padding: "12px 14px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}