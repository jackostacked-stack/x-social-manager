"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseBrowser";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px 14px",
        borderRadius: 16,
        background: "transparent",
        border: "1px solid #22242D",
        color: "#B9B9C8",
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: "-0.01em",
        transition:
          "background 0.18s ease, border-color 0.18s ease, color 0.18s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#18181F";
        e.currentTarget.style.borderColor = "#2A2D38";
        e.currentTarget.style.color = "#FCFCFC";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.borderColor = "#22242D";
        e.currentTarget.style.color = "#B9B9C8";
      }}
    >
      Logout
    </button>
  );
}