"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
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

        {/* Right: minimal auth-aware actions */}
        <div className="flex items-center gap-3">
          {authed ? (
            <>
              {/* Show dashboard button if not already on dashboard */}
              {!pathname?.startsWith("/dashboard") && (
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Dashboard
                </Link>
              )}
            </>
          ) : (
            <>
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