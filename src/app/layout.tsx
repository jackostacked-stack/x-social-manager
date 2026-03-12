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
};

async function getAccountProfile() {
  try {
    let baseUrl = "http://localhost:3000";

    if (process.env.NEXT_PUBLIC_SITE_URL) {
      baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
    } else if (process.env.VERCEL_URL) {
      baseUrl = process.env.VERCEL_URL.startsWith("http")
        ? process.env.VERCEL_URL
        : `https://${process.env.VERCEL_URL}`;
    }

    const res = await fetch(`${baseUrl}/api/account-profile`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.account || null;
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const account = await getAccountProfile();

  return (
    <html lang="en">
      <body>
        <div
          style={{
            height: "100vh",
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
                marginTop: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 14,
                  borderRadius: 20,
                  background: "#18181F",
                  border: "1px solid #22242D",
                }}
              >
                {account?.avatar_url ? (
                  <img
                    src={account.avatar_url}
                    alt={account.name || "Account avatar"}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "9999px",
                      objectFit: "cover",
                      border: "1px solid #22242D",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "9999px",
                      background: "#22242D",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#FCFCFC",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {account?.name?.charAt(0)?.toUpperCase() || "F"}
                  </div>
                )}

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      color: "#FCFCFC",
                      fontWeight: 700,
                      fontSize: 14,
                      lineHeight: 1.2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {account?.name || "flow account"}
                  </div>

                  <div
                    style={{
                      color: "#787A8D",
                      fontSize: 13,
                      marginTop: 4,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {account?.username ? `@${account.username}` : "@flow"}
                  </div>
                </div>
              </div>

              <LogoutButton />
            </div>
          </aside>

          <main
            style={{
              flex: 1,
              padding: 28,
              overflowY: "auto",
            }}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}