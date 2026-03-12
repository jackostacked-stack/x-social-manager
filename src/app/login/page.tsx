"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
        background:
          "radial-gradient(circle at top, rgba(109,140,255,0.16), transparent 35%), #101114",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#18181F",
          border: "1px solid #22242D",
          borderRadius: 24,
          padding: 28,
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.02), 0 20px 50px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <Image
            src="/flow-logo.png"
            alt="flow logo"
            width={180}
            height={54}
            style={{
              width: "auto",
              height: 54,
              objectFit: "contain",
            }}
            priority
          />
        </div>

        <div
          style={{
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          <h1
            style={{
              margin: 0,
              color: "#FCFCFC",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            Welcome back
          </h1>

          <p
            style={{
              marginTop: 10,
              marginBottom: 0,
              color: "#B9B9C8",
              fontSize: 15,
              lineHeight: 1.5,
            }}
          >
            Sign in to access your Tweetflow dashboard.
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                color: "#FCFCFC",
                fontWeight: 600,
                fontSize: 14,
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
                padding: "14px 16px",
                borderRadius: 16,
                background: "#101114",
                border: "1px solid #22242D",
                color: "#FCFCFC",
              }}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                color: "#FCFCFC",
                fontWeight: 600,
                fontSize: 14,
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
                padding: "14px 16px",
                borderRadius: 16,
                background: "#101114",
                border: "1px solid #22242D",
                color: "#FCFCFC",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 16,
                background: "rgba(175,18,60,0.15)",
                border: "1px solid rgba(175,18,60,0.35)",
                color: "#FCFCFC",
                fontSize: 14,
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
              background: "#6D8CFF",
              color: "#FCFCFC",
              border: "none",
              borderRadius: 9999,
              padding: "14px 18px",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
              boxShadow: "0 10px 30px rgba(109,140,255,0.25)",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}