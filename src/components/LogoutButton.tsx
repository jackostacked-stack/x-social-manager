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
        marginTop: 20,
        width: "100%",
        background: "#374151",
        color: "#ffffff",
        border: "none",
        borderRadius: 8,
        padding: "10px 12px",
        cursor: "pointer",
      }}
    >
      Logout
    </button>
  );
}