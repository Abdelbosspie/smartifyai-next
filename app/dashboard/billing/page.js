"use client";


import { useEffect, useState, Suspense } from "react";
import { useSession, SessionProvider } from "next-auth/react";
import { useSearchParams } from "next/navigation";

/**
 * ========= HOW TO WIRE PLANS =========
 * Put your Stripe PRICE IDs in .env.local (client-side safe):
 *
 * NEXT_PUBLIC_STRIPE_PRICE_HOBBY=price_XXXX
 * NEXT_PUBLIC_STRIPE_PRICE_STANDARD=price_YYYY
 * NEXT_PUBLIC_STRIPE_PRICE_PRO=price_ZZZZ
 *
 * Then restart dev server.
 */
const PRICE_IDS = {
  hobby: process.env.NEXT_PUBLIC_STRIPE_PRICE_HOBBY,
  standard: process.env.NEXT_PUBLIC_STRIPE_PRICE_STANDARD,
  pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
};

// The UI labels below are just visuals. Stripe charges based on PRICE_IDS.
const PLAN_CARDS = [
  {
    key: "hobby",
    name: "Hobby",
    price: "$50",
    period: "/mo",
    desc: "Ideal for hobby projects with more messages and AI actions.",
    features: ["1 AI agent", "2,000 messages/month", "5 AI actions", "Basic analytics", "Email support"],
    highlight: false,
  },
  {
    key: "standard",
    name: "Standard",
    price: "$150",
    period: "/mo",
    desc: "Popular choice for small teams with multiple agents and seats.",
    features: ["2 AI agents", "12,000 messages/month", "10 AI actions", "3 seats", "Standard analytics"],
    highlight: true, // Popular
  },
  {
    key: "pro",
    name: "Pro",
    price: "$500",
    period: "/mo",
    desc: "Advanced features and seats for growing businesses.",
    features: ["3 AI agents", "40,000 messages/month", "Advanced analytics", "5+ seats", "Priority email support"],
    highlight: false,
  },
];

function BillingContent() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [upgrading, setUpgrading] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [showPlans, setShowPlans] = useState(false);

  const { data: session } = useSession();
  const search = useSearchParams();
  const success = search.get("success") === "1";
  const canceled = search.get("canceled") === "1";
  const [plan, setPlan] = useState("Loading...");

  const sessionId = search.get("session_id");

  async function fetchPlan() {
    try {
      const res = await fetch("/api/user/getPlan", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      setPlan(data.plan || "Free");
    } catch {
      setPlan("Free");
    }
  }

  useEffect(() => {
    fetchPlan();
  }, []);

  useEffect(() => {
    async function apply() {
      if (success && sessionId) {
        try {
          await fetch("/api/billing/apply-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: sessionId }),
          }).catch(() => {});
          await fetchPlan();
        } catch {}
      }
    }
    apply();
  }, [success, sessionId]);

  // Load live billing summary if you have it; otherwise page still works
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/billing/summary", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (alive) setSummary(data);
        } else {
          if (alive) setSummary(null);
        }
      } catch {
        if (alive) setSummary(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // ESC closes modal
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setShowPlans(false);
    if (showPlans) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showPlans]);

  async function startCheckout(priceId) {
    try {
      setError("");
      setUpgrading(true);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "checkout", priceId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.url) throw new Error(json?.error || "Failed to start checkout.");
      window.location.href = json.url;
    } catch (e) {
      setError(e?.message || "Failed to start checkout.");
    } finally {
      setUpgrading(false);
    }
  }

  async function openPortal() {
    try {
      setError("");
      setOpeningPortal(true);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "portal" }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.url) throw new Error(json?.error || "Failed to open billing portal.");
      window.location.href = json.url;
    } catch (e) {
      setError(e?.message || "Failed to open billing portal.");
    } finally {
      setOpeningPortal(false);
    }
  }

  const renewalText =
    summary?.renewalText ||
    summary?.renewalDescription ||
    (summary?.renewsAt ? `Renews ${new Date(summary.renewsAt).toLocaleDateString()}` : null);
  const agentsIncluded = summary?.limits?.agents ?? summary?.agentsIncluded ?? null;
  const current = summary?.thisMonth || summary?.current || {};
  const amountThisMonth = typeof current?.amount === "number" ? current.amount : null;
  const conversationsThisMonth = typeof current?.conversations === "number" ? current.conversations : null;
  const overageAmount = typeof current?.overage === "number" ? current.overage : null;
  const currency = summary?.currency || summary?.currency_code || summary?.currencyCode || "USD";

  const fmtMoney = (n) => {
    if (typeof n !== "number" || !isFinite(n)) return "—";
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
    } catch {
      return `${currency} ${n.toFixed(2)}`;
    }
  };

  const anyPriceMissing =
    !PRICE_IDS.hobby || !PRICE_IDS.standard || !PRICE_IDS.pro;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Billing</h1>
        <p className="text-sm text-gray-500">Manage your plan and payment method.</p>
        <div className="mt-4">
          <p className="text-sm text-gray-500">Current Plan</p>
          <p className="text-lg font-semibold text-gray-900">{plan}</p>
          <p className="mt-1 text-xs text-gray-500">
            {[renewalText, typeof agentsIncluded === "number" ? `${agentsIncluded} agents` : null]
              .filter(Boolean)
              .join(" • ") || "—"}
          </p>
        </div>
      </header>

      {success && (
        <div className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
          Subscription activated — welcome aboard!
        </div>
      )}
      {canceled && (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          Checkout cancelled. You weren’t charged.
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            {/* Removed Current Plan display here as it's moved to header */}
          </div>
          <div className="flex gap-2">
            {/* This now opens the pricing modal instead of starting checkout directly */}
            <button
              onClick={() => setShowPlans(true)}
              className="inline-flex h-10 items-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Upgrade / Subscribe
            </button>
            <button
              onClick={openPortal}
              disabled={openingPortal}
              className="inline-flex h-10 items-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 hover:border-gray-300 disabled:opacity-60"
            >
              {openingPortal ? "Connecting…" : "Manage Billing"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            {error}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Stat label="This Month" value={fmtMoney(amountThisMonth)} loading={loading} />
          <Stat
            label="Conversations"
            value={typeof conversationsThisMonth === "number" ? conversationsThisMonth.toLocaleString() : "—"}
            loading={loading}
          />
          <Stat label="Overage" value={fmtMoney(overageAmount)} loading={loading} />
        </div>

        {!loading && !summary && (
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            Billing summary not connected. You can still subscribe using the Upgrade button above.
          </div>
        )}
      </div>

      {/* === PRICING MODAL (Hobby, Standard, Pro) === */}
      {showPlans && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          aria-modal="true"
          role="dialog"
          onClick={(e) => {
            // click outside dialog to close
            if (e.target === e.currentTarget) setShowPlans(false);
          }}
        >
          <div className="w-full max-w-5xl rounded-2xl border border-gray-200 bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-slate-900">Choose a plan</h3>
              <button
                className="rounded-md border border-gray-200 px-2 py-1 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setShowPlans(false)}
              >
                Close
              </button>
            </div>

            {/* Pricing grid (styled like your homepage, trimmed to 3 plans) */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PLAN_CARDS.map((plan) => {
                  const priceId =
                    plan.key === "hobby"
                      ? PRICE_IDS.hobby
                      : plan.key === "standard"
                      ? PRICE_IDS.standard
                      : PRICE_IDS.pro;

                  const disabled = !priceId || upgrading;

                  return (
                    <div
                      key={plan.key}
                      className={`w-full h-full flex flex-col p-8 rounded-2xl border transition-all duration-300 min-h-[560px] ${
                        plan.highlight
                          ? "bg-indigo-50 border-indigo-300 shadow-sm hover:shadow-md hover:-translate-y-1"
                          : "bg-white border-gray-200 hover:border-indigo-400 hover:shadow-md hover:-translate-y-1"
                      }`}
                    >
                      {/* Header area */}
                      <div className="h-[220px] flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <h3 className="text-2xl font-semibold text-slate-900">{plan.name}</h3>
                          {plan.key === "standard" && (
                            <span className="ml-2 bg-indigo-100 text-indigo-700 rounded-full text-[10px] leading-none px-3 py-1">
                              Popular
                            </span>
                          )}
                        </div>

                        <div className="flex items-baseline gap-2">
                          <div className="text-slate-900 text-4xl font-bold leading-none tracking-tight">
                            {plan.price}
                          </div>
                          {plan.period && <span className="text-gray-500 text-base">{plan.period}</span>}
                        </div>

                        <p className="mt-3 text-sm text-gray-600">{plan.desc}</p>

                        <button
                          onClick={() => startCheckout(priceId)}
                          disabled={disabled}
                          className={`w-full py-2.5 mt-4 text-sm font-medium rounded-lg transition-all duration-300 text-center ${
                            plan.highlight
                              ? "bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60"
                              : "border border-gray-400 text-slate-700 hover:border-indigo-500 hover:text-indigo-700 disabled:opacity-60"
                          }`}
                          title={!priceId ? "Set NEXT_PUBLIC_STRIPE_PRICE_* env vars" : ""}
                        >
                          {upgrading ? "Opening…" : `Choose ${plan.name}`}
                        </button>
                        {!priceId && (
                          <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                            Missing Price ID. Set <code>NEXT_PUBLIC_STRIPE_PRICE_{plan.key.toUpperCase()}</code> in
                            .env.local
                          </p>
                        )}
                      </div>

                      <hr className="my-6 border-gray-200" />

                      <ul className="space-y-3 text-slate-700">
                        {plan.features.map((f, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-indigo-600">✔</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BillingPage() {
  return (
    <SessionProvider>
      <Suspense fallback={<div />}>
        <BillingContent />
      </Suspense>
    </SessionProvider>
  );
}
function Stat({ label, value, loading }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-gray-900">
        {loading ? <span className="inline-flex animate-pulse rounded bg-gray-100 px-6 py-2" /> : value}
      </p>
    </div>
  );
}