import "./globals.css";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export const metadata = {
  title: "AI X Manager",
  description: "Manage AI-generated tweets",
};

const linkStyle = {
  color: "#fff",
  textDecoration: "none",
  padding: "10px 12px",
  borderRadius: "8px",
  display: "block",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "Arial, sans-serif",
          background: "#f7f7f8",
        }}
      >
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <aside
            style={{
              width: 240,
              background: "#111827",
              color: "#fff",
              padding: 20,
              boxSizing: "border-box",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 24 }}>Tweetflow</h2>

            <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link href="/" style={linkStyle}>
                Manager
              </Link>
              <Link href="/queue" style={linkStyle}>
                Queue
              </Link>
              <Link href="/scheduled" style={linkStyle}>
                Scheduled
              </Link>
              <Link href="/posted" style={linkStyle}>
                Posted
              </Link>
              <Link href="/analytics" style={linkStyle}>
                Analytics
              </Link>
            </nav>

            <LogoutButton />
          </aside>

          <main
            style={{
              flex: 1,
              padding: 32,
              boxSizing: "border-box",
            }}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}