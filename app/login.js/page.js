"use client";
import React, { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      email: e.target.email.value,
      password: e.target.password.value,
    };

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Logged in successfully!");
        window.location.href = "/dashboard";
      } else {
        alert("❌ " + (data.message || "Login failed"));
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Login Form */}
      <section className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-semibold text-center mb-6">
            Welcome back to <span className="text-indigo-500">SmartifyAI</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-medium transition-all ${
                loading ? "bg-gray-400" : "bg-indigo-500 hover:bg-indigo-600"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="flex justify-between items-center text-sm text-gray-500 mt-6">
            <Link href="/forgot-password" className="hover:text-indigo-500">
              Forgot password?
            </Link>
            <Link href="/register" className="text-indigo-500 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}