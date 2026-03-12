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
              color: active ? "#FCFCFC" : "#B9B9C8",
              background: active ? "rgba(109,140,255,0.18)" : "transparent",
              border: active
                ? "1px solid rgba(109,140,255,0.26)"
                : "1px solid transparent",
              boxShadow: active
                ? "inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 24px rgba(109,140,255,0.12)"
                : "none",
              transition:
                "background 0.18s ease, border-color 0.18s ease, color 0.18s ease, transform 0.18s ease",
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.background = "#18181F";
                e.currentTarget.style.border = "1px solid #22242D";
                e.currentTarget.style.color = "#FCFCFC";
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.border = "1px solid transparent";
                e.currentTarget.style.color = "#B9B9C8";
              }
            }}
          >
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}