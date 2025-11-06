"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Topbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const authed = status === "authenticated";

  return (
    <header className="sticky top-0 z-40 border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Left: logo -> always takes you to main page */}
        <Link href="/" className="font-semibold">
          SmartifyAI
        </Link>

        {/* Right: auth-aware actions */}
        <div className="flex items-center gap-3">
          {/* If logged in, show Dashboard CTA (replaces “Try for free”) */}
          {authed ? (
            <>
              {/* Hide the Dashboard button if we are already on /dashboard* */}
              {!pathname?.startsWith("/dashboard") && (
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Dashboard
                </Link>
              )}

              {/* Simple user menu */}
              <div className="relative group">
                <button className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">
                  <img
                    src={session?.user?.image || `https://www.gravatar.com/avatar?d=mp`}
                    alt="avatar"
                    className="h-6 w-6 rounded-full"
                  />
                  <span className="max-w-[120px] truncate">
                    {session?.user?.name || session?.user?.email}
                  </span>
                </button>
                <div className="absolute right-0 mt-2 hidden w-44 rounded-lg border bg-white p-1 shadow-md group-hover:block">
                  <Link
                    href="/dashboard/settings"
                    className="block rounded px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full rounded px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Not logged in: show Try for free + Login */}
              <Link
                href="/register"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Try for free
              </Link>
              <Link
                href="/login"
                className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Log in
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}