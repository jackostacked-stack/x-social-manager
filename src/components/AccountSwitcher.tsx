"use client";

import { useEffect, useState } from "react";

type Account = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
};

export default function AccountSwitcher() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [active, setActive] = useState<Account | null>(null);
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState("");

  async function loadAccounts() {
    try {
      const res = await fetch("/api/accounts", { cache: "no-store" });
      const data = await res.json();

      const list: Account[] = data.accounts || [];
      setAccounts(list);

      const activeAccount = list.find((a) => a.is_active) || null;
      setActive(activeAccount);
    } catch {
      setAccounts([]);
      setActive(null);
    }
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  async function switchAccount(id: string) {
    try {
      setSwitching(true);
      setError("");

      const res = await fetch("/api/accounts/active", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ account_id: id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to switch account");
        setSwitching(false);
        return;
      }

      window.location.reload();
    } catch {
      setError("Failed to switch account");
      setSwitching(false);
    }
  }

  function connectX() {
    window.location.href = "/api/x/connect";
  }

  const activeName = active ? active.display_name || active.username : "No Account";
  const activeUsername = active ? "@" + active.username : "Connect account";
  const activeAvatar = active ? active.avatar_url : null;

  return (
    <div style={container}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={trigger}
      >
        <div style={triggerLeft}>
          {activeAvatar ? (
            <img
              src={activeAvatar}
              alt={activeName}
              style={avatar}
            />
          ) : (
            <div style={avatarFallback}>X</div>
          )}

          <div>
            <div style={name}>{activeName}</div>
            <div style={username}>{activeUsername}</div>
          </div>
        </div>

        <div style={caret}>▾</div>
      </button>

      {open ? (
        <div style={menu}>
          {error ? <div style={errorText}>{error}</div> : null}

          {accounts.length === 0 ? (
            <div style={emptyState}>No X accounts connected yet.</div>
          ) : null}

          {accounts.map((account) => {
            const accountName = account.display_name || account.username;
            const accountUser = "@" + account.username;

            return (
              <button
                key={account.id}
                type="button"
                style={{
                  ...menuItem,
                  background: account.is_active ? "rgba(109,140,255,0.12)" : "transparent",
                  border: account.is_active
                    ? "1px solid rgba(109,140,255,0.22)"
                    : "1px solid transparent",
                  opacity: switching ? 0.7 : 1,
                }}
                onClick={() => switchAccount(account.id)}
                disabled={switching}
              >
                <div style={menuLeft}>
                  {account.avatar_url ? (
                    <img
                      src={account.avatar_url}
                      alt={accountName}
                      style={menuAvatar}
                    />
                  ) : (
                    <div style={menuAvatarFallback}>X</div>
                  )}

                  <div>
                    <div style={menuName}>{accountName}</div>
                    <div style={menuUser}>{accountUser}</div>
                  </div>
                </div>

                {account.is_active ? (
                    <div style={activeDot}>●</div>
                ) : null}
              </button>
            );
          })}

          <div style={divider} />

          <button
            type="button"
            style={connectButton}
            onClick={connectX}
          >
            + Connect X Account
          </button>
        </div>
      ) : null}
    </div>
  );
}

const container: React.CSSProperties = {
  position: "relative",
};

const trigger: React.CSSProperties = {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#18181F",
  border: "1px solid #22242D",
  borderRadius: 18,
  padding: 14,
  color: "#FCFCFC",
  cursor: "pointer",
};

const triggerLeft: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const avatar: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 999,
  objectFit: "cover",
};

const avatarFallback: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 999,
  background: "#22242D",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#FCFCFC",
  fontWeight: 700,
};

const name: React.CSSProperties = {
  fontWeight: 700,
  fontSize: 14,
  color: "#FCFCFC",
};

const username: React.CSSProperties = {
  fontSize: 12,
  color: "#787A8D",
};

const caret: React.CSSProperties = {
  color: "#787A8D",
};

const menu: React.CSSProperties = {
  position: "absolute",
  bottom: "110%",
  left: 0,
  width: "100%",
  background: "#18181F",
  border: "1px solid #22242D",
  borderRadius: 16,
  padding: 10,
  zIndex: 50,
};

const errorText: React.CSSProperties = {
  color: "#ff8f8f",
  fontSize: 12,
  padding: "4px 6px 10px 6px",
};

const emptyState: React.CSSProperties = {
  color: "#B9B9C8",
  fontSize: 13,
  padding: "8px 6px",
};

const menuItem: React.CSSProperties = {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 10,
  borderRadius: 12,
  cursor: "pointer",
  border: "1px solid transparent",
  color: "#FCFCFC",
};

const menuLeft: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const menuAvatar: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 999,
  objectFit: "cover",
};

const menuAvatarFallback: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 999,
  background: "#22242D",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#FCFCFC",
  fontWeight: 700,
  fontSize: 12,
};

const menuName: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "#FCFCFC",
};

const menuUser: React.CSSProperties = {
  fontSize: 12,
  color: "#787A8D",
};

const activeDot: React.CSSProperties = {
  color: "#6D8CFF",
  fontSize: 11,
};

const divider: React.CSSProperties = {
  height: 1,
  background: "#22242D",
  margin: "8px 0",
};

const connectButton: React.CSSProperties = {
  width: "100%",
  padding: 10,
  borderRadius: 12,
  background: "#6D8CFF",
  border: "none",
  color: "#FCFCFC",
  cursor: "pointer",
  fontWeight: 600,
};