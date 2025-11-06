"use client";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    const email = e.currentTarget.email.value.trim();
    const password = e.currentTarget.password.value;

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setErr("Invalid email or password.");
      return;
    }
    // success
    window.location.href = "/dashboard";
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h1 className="text-center text-2xl font-semibold mb-6">
          Sign in to <span className="text-indigo-600">SmartifyAI</span>
        </h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 outline-none"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 outline-none"
          />

          {err && <p className="text-sm text-red-600">{err}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 text-white py-2.5 font-medium hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-3 text-center text-sm text-gray-600">
          New here?{" "}
          <a href="/register" className="text-indigo-600 hover:underline">
            Create an account
          </a>
        </p>
      </div>
    </main>
  );
}