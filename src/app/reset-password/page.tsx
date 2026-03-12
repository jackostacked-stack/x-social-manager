"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseBrowser";

export default function ResetPasswordPage() {
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", ""));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    async function setupSession() {
      if (!accessToken || !refreshToken) {
        setError("Invalid or expired reset link.");
        return;
      }

      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setReady(true);
    }

    setupSession();
  }, [supabase]);

  async function handleReset(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage("Password updated successfully. You can now go back to login.");
    setLoading(false);
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
          Reset Password
        </h1>

        <p style={{ marginTop: 0, marginBottom: 20, color: "#6b7280" }}>
          Choose a new password for your Tweetflow account.
        </p>

        {!ready && !error && (
          <p style={{ color: "#6b7280" }}>Preparing reset session...</p>
        )}

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

        {ready && (
          <form onSubmit={handleReset}>
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  color: "#111827",
                  fontWeight: 600,
                }}
              >
                New Password
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

            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  color: "#111827",
                  fontWeight: 600,
                }}
              >
                Confirm Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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

            {message && (
              <div
                style={{
                  marginBottom: 14,
                  padding: 12,
                  borderRadius: 10,
                  background: "#dcfce7",
                  color: "#166534",
                }}
              >
                {message}
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
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}