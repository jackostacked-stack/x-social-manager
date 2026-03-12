import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import LogoutButton from "@/components/LogoutButton";

export const metadata = {
  title: "flow",
  description: "Manage AI-generated tweets",
};

const navLinkStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "12px 14px",
  borderRadius: "9999px",
  color: "#B9B9C8",
  background: "transparent",
  border: "1px solid transparent",
  textDecoration: "none",
  transition: "all 0.18s ease",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            background: "#101114",
          }}
        >
          <aside
            style={{
              width: 260,
              padding: 18,
              borderRight: "1px solid #22242D",
              background: "#101114",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 6px 18px 6px",
                }}
              >
                <Image
                  src="/flow-logo.png"
                  alt="flow logo"
                  width={132}
                  height={40}
                  style={{
                    height: 40,
                    width: "auto",
                    objectFit: "contain",
                  }}
                  priority
                />
              </div>

              <nav
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <Link href="/" style={navLinkStyle}>
                  Manager
                </Link>

                <Link href="/queue" style={navLinkStyle}>
                  Queue
                </Link>

                <Link href="/scheduled" style={navLinkStyle}>
                  Scheduled
                </Link>

                <Link href="/posted" style={navLinkStyle}>
                  Posted
                </Link>

                <Link href="/analytics" style={navLinkStyle}>
                  Analytics
                </Link>
              </nav>
            </div>

            <div
              style={{
                paddingTop: 20,
                borderTop: "1px solid #22242D",
              }}
            >
              <LogoutButton />
            </div>
          </aside>

          <main
            style={{
              flex: 1,
              padding: 28,
              background: "#101114",
            }}
          >
            <div
              style={{
                minHeight: "calc(100vh - 56px)",
                borderRadius: 24,
                background: "#101114",
              }}
            >
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}