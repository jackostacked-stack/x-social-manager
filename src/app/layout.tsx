import "./globals.css";
import Image from "next/image";
import { Inter } from "next/font/google";
import LogoutButton from "@/components/LogoutButton";
import SidebarNav from "@/components/SidebarNav";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "flow",
  description: "Manage AI-generated tweets",
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
      <body className={inter.className}>
        <div
          style={{
            height: "100vh",
            display: "flex",
            background: "#101114",
          }}
        >
          <aside
            style={{
              width: 268,
              padding: 18,
              borderRight: "1px solid #22242D",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.01) 0%, rgba(255,255,255,0) 100%), #101114",
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
                  padding: "6px 6px 18px 6px",
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

              <SidebarNav />
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
                  boxShadow:
                    "0 0 0 1px rgba(255,255,255,0.02), 0 10px 24px rgba(0,0,0,0.24)",
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
                      border: "1px solid #2A2D38",
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
                      letterSpacing: "-0.01em",
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