import "./globals.css";
import Image from "next/image";
import { Inter } from "next/font/google";
import LogoutButton from "@/components/LogoutButton";
import SidebarNav from "@/components/SidebarNav";
import AccountSwitcher from "@/components/AccountSwitcher";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Tweetflow",
  description: "AIO Tweet Manager & Scheduler",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
              <AccountSwitcher />
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