"use client";
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Link from "next/link";
import Navbar from "../../components/Navbar";

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <h1 className="text-3xl font-bold text-slate-900">Chatbots</h1>
          <p className="mt-2 text-slate-600">
            Manage your AI chatbots here. (Temporary placeholder to satisfy Next build.)
          </p>
        </div>
      </main>
    </>
  );
}