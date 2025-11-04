"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="border-b border-slate-200 sticky top-0 z-50 bg-white">
        <nav className="flex justify-between items-center px-8 py-6">
          {/* Brand (click -> home). Smartify turns blue on hover/active */}
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-slate-900 hover:text-indigo-600 active:text-indigo-700 transition-colors"
          >
            <span className="inline-block">Smartify</span>
            <span className="text-indigo-600">AI</span>
          </Link>

          {/* Desktop menu */}
          <ul className="hidden md:flex gap-8 text-slate-600 text-base font-medium">
            <li>
              <Link href="/#features" className="hover:text-slate-900 transition-all duration-300">
                Features
              </Link>
            </li>
            <li>
              <Link href="/#how-it-works" className="hover:text-slate-900 transition-all duration-300">
                How It Works
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-slate-900 transition-all duration-300">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="hover:text-slate-900 transition-all duration-300">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/#contact" className="hover:text-slate-900 transition-all duration-300">
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <main className="flex h-screen items-center justify-center bg-white overflow-hidden fixed inset-0">
        <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-md">
          <h1 className="mb-4 text-center text-2xl font-semibold text-gray-900">Create your SmartifyAI account</h1>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirm-password"
                name="confirm-password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              Sign Up
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              Login here
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}