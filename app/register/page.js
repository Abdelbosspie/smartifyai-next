"use client";
import { useState } from "react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();                   // ⬅️ stops the GET submit
    setErr("");
    setLoading(true);

    const form = e.currentTarget;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    if (password !== confirmPassword) {
      setErr("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || "Registration failed.");

      alert("Account created successfully!");
      window.location.href = "/login";
    } catch (e) {
      setErr(e.message || "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h1 className="text-center text-2xl font-semibold mb-6">
          Create your <span className="text-indigo-600">SmartifyAI</span> account
        </h1>

        {/* IMPORTANT: no action/method; onSubmit handles POST */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="name" type="text" placeholder="Full name" required
                 className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 outline-none"/>
          <input name="email" type="email" placeholder="Email" required
                 className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 outline-none"/>
          <input name="password" type="password" placeholder="Password" required
                 className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 outline-none"/>
          <input name="confirmPassword" type="password" placeholder="Confirm password" required
                 className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 outline-none"/>

          {err && <p className="text-sm text-red-600">{err}</p>}

          <button type="submit" disabled={loading}
                  className="w-full rounded-lg bg-indigo-600 text-white py-2.5 font-medium hover:bg-indigo-700 disabled:opacity-60">
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-3 text-center text-sm text-gray-600">
          Already have an account? <a href="/login" className="text-indigo-600 hover:underline">Login here</a>
        </p>
      </div>
    </main>
  );
}