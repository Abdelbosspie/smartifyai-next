"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/agents", label: "Agents" },
  { href: "/dashboard/usage", label: "Usage" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function Sidebar({ user: userFromProps }) {
  const pathname = usePathname();

  // If layout passed a user, use it; otherwise fetch from NextAuth session API.
  const [user, setUser] = useState(userFromProps || null);
  const [loadingUser, setLoadingUser] = useState(!userFromProps);

  useEffect(() => {
    let alive = true;

    // 1) Seed from localStorage for instant UI
    try {
      const cached = localStorage.getItem("smartify:user");
      if (!userFromProps && cached) {
        const u = JSON.parse(cached);
        if (u && (u.name || u.email)) {
          setUser((prev) => prev || u);
        }
      }
    } catch {}

    // 2) If parent provided a user, use it immediately
    if (userFromProps && alive) {
      setUser(userFromProps);
      setLoadingUser(false);
    }

    // 3) Fetch live session (authoritative)
    (async () => {
      try {
        setLoadingUser(true);
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          const me = json?.user || null;
          if (alive) {
            setUser(me);
            try {
              if (me) {
                localStorage.setItem(
                  "smartify:user",
                  JSON.stringify({ name: me.name || "", email: me.email || "", image: me.image || null })
                );
              }
            } catch {}
          }
        }
      } catch {
        // ignore network/session failures
      } finally {
        if (alive) setLoadingUser(false);
      }
    })();

    // 4) Live updates from Settings
    const onUserUpdated = (e) => {
      const { name, email, image } = e?.detail || {};
      setUser((prev) => ({
        ...(prev || {}),
        ...(typeof name !== "undefined" ? { name } : {}),
        ...(typeof email !== "undefined" ? { email } : {}),
        ...(typeof image !== "undefined" ? { image } : {}),
      }));
      try {
        const current = JSON.parse(localStorage.getItem("smartify:user") || "{}");
        const next = {
          ...current,
          ...(typeof name !== "undefined" ? { name } : {}),
          ...(typeof email !== "undefined" ? { email } : {}),
          ...(typeof image !== "undefined" ? { image } : {}),
        };
        localStorage.setItem("smartify:user", JSON.stringify(next));
      } catch {}
    };
    window.addEventListener("user:updated", onUserUpdated);

    return () => {
      alive = false;
      window.removeEventListener("user:updated", onUserUpdated);
    };
  }, [userFromProps]);

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-white">
      {/* Brand */}
      <div className="p-4">
        <Link href="/dashboard" className="block text-xl font-semibold">
          SmartifyAI
        </Link>
      </div>

      {/* Nav */}
      <nav className="px-2">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <NavItem key={item.href} href={item.href} active={active}>
              {item.label}
            </NavItem>
          );
        })}
      </nav>

      {/* Bottom account/logout */}
      <SidebarAccountFooter user={user} loading={loadingUser} />
    </aside>
  );
}

function NavItem({ href, active, children }) {
  return (
    <Link
      href={href}
      className={[
        "mb-1 block rounded-lg px-3 py-2 text-sm",
        active
          ? "bg-indigo-50 font-medium text-indigo-700"
          : "text-gray-700 hover:bg-gray-50",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

function SidebarAccountFooter({ user, loading }) {
  const displayName = user?.name ?? "User";
  const displayEmail = user?.email ?? "";
  const avatar = user?.image;

  async function handleLogout() {
    try {
      await signOut({ callbackUrl: "/login" });
    } catch {
      window.location.href = "/login";
    }
  }

  return (
    <div className="mt-auto border-t p-3 space-y-3">
      {/* Home Page Link */}
      <Link
        href="/"
        className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-700 transition"
      >
        Home Page
      </Link>

      {/* User Info */}
      <div className="flex items-center gap-3">
        <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-100">
          {avatar ? (
            <Image src={avatar} alt={displayName} fill />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs text-gray-500">
              {displayName?.[0]?.toUpperCase() || "U"}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900">
            {loading ? "Loading…" : displayName}
          </p>
          {displayEmail ? (
            <p className="truncate text-xs text-gray-500">
              {loading ? " " : displayEmail}
            </p>
          ) : null}
        </div>
      </div>

      

      {/* Logout Button */}
      <div>
        <button
          onClick={handleLogout}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm hover:border-gray-300"
        >
          Logout
        </button>
      </div>
    </div>
  );
}