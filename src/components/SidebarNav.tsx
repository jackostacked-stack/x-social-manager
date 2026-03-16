"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Manager" },
  { href: "/queue", label: "Queue" },
  { href: "/scheduled", label: "Scheduled" },
  { href: "/posted", label: "Posted" },
  { href: "/analytics", label: "Analytics" },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        marginTop: 4,
      }}
    >
      {items.map((item) => {
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 14px",
              borderRadius: 16,
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: active ? "#FFFFFF" : "#B9B9C8",
              background: active
                ? "linear-gradient(180deg, rgba(109,140,255,0.25), rgba(109,140,255,0.08))"
                : "transparent",
              border: active
                ? "1px solid rgba(109,140,255,0.35)"
                : "1px solid transparent",
              boxShadow: active
                ? "0 0 18px rgba(109,140,255,0.25), inset 0 1px 0 rgba(255,255,255,0.04)"
                : "none",
              transform: active ? "translateY(-1px)" : "none",
              transition:
                "all 0.18s ease, background 0.18s ease, border-color 0.18s ease",
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.background = "#18181F";
                e.currentTarget.style.border = "1px solid #22242D";
                e.currentTarget.style.color = "#FFFFFF";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.border = "1px solid transparent";
                e.currentTarget.style.color = "#B9B9C8";
                e.currentTarget.style.transform = "none";
              }
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}