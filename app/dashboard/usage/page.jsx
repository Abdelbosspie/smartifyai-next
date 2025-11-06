"use client";

import React, { useEffect, useMemo, useState } from "react";

export default function UsagePage() {
  const [range, setRange] = useState("7d"); // 24h | 7d | 30d
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({
    totalMessages: 0,
    totalAgents: 0,
    chatAgents: 0,
    voiceAgents: 0,
  });
  const [daily, setDaily] = useState([]); // [{date, messages, tokens, cost}]

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`/api/usage?range=${range}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Failed to load usage (${res.status})`);
        const data = await res.json();
        setSummary({
          totalMessages: data?.totalMessages ?? 0,
          totalAgents: data?.totalAgents ?? 0,
          chatAgents: data?.chatAgents ?? 0,
          voiceAgents: data?.voiceAgents ?? 0,
        });
        setDaily(Array.isArray(data?.daily) ? data.daily : []);
      } catch (e) {
        setError(e?.message || "Failed to load usage.");
        setSummary({
          totalMessages: 0,
          totalAgents: 0,
          chatAgents: 0,
          voiceAgents: 0,
        });
        setDaily([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [range]);

  const totals = useMemo(
    () => ({
      messages: daily.reduce((s, r) => s + r.messages, 0),
      tokens: daily.reduce((s, r) => s + r.tokens, 0),
      cost: daily.reduce((s, r) => s + r.cost, 0),
    }),
    [daily]
  );

  function downloadCSV() {
    if (!daily.length) return;
    const header = ["Date", "Messages", "Tokens", "Cost(USD)"];
    const rows = daily.map((r) => [r.date, r.messages, r.tokens, r.cost]);
    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `usage_${range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Usage</h1>
          <p className="text-sm text-gray-500">
            Track messages, tokens, and estimated cost.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["24h", "7d", "30d"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-lg border px-3 py-1.5 text-sm ${
                range === r
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-indigo-300"
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
          <button
            onClick={downloadCSV}
            disabled={!daily.length}
            className="ml-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:border-indigo-300 disabled:opacity-60"
          >
            Download CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Messages" value={summary.totalMessages || 0} />
        <StatCard label="Total Tokens" value={totals.tokens.toLocaleString()} />
        <StatCard label="Estimated Cost" value={`$${totals.cost.toFixed(4)}`} />
        <StatCard
          label="Agents"
          value={`${summary.totalAgents} • ${summary.chatAgents} chat • ${summary.voiceAgents} voice`}
        />
      </div>

      {/* Daily table */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between p-4">
          <div>
            <h3 className="text-sm font-semibold">Daily Breakdown</h3>
            <p className="text-xs text-gray-500">
              {loading ? "Loading…" : `${daily.length} rows`}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-t border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Messages</th>
                <th className="px-4 py-2">Tokens</th>
                <th className="px-4 py-2">Est. Cost (USD)</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((r) => (
                <tr key={r.date} className="border-b border-gray-100">
                  <td className="px-4 py-2 text-gray-700">{r.date}</td>
                  <td className="px-4 py-2">{r.messages}</td>
                  <td className="px-4 py-2">{r.tokens.toLocaleString()}</td>
                  <td className="px-4 py-2">${r.cost.toFixed(4)}</td>
                </tr>
              ))}
              {daily.length === 0 && !loading && (
                <tr>
                  <td className="px-4 py-6 text-sm text-gray-500" colSpan={4}>
                    No usage yet.
                  </td>
                </tr>
              )}
            </tbody>
            {daily.length > 0 && (
              <tfoot>
                <tr className="border-t border-gray-200 bg-gray-50 font-medium">
                  <td className="px-4 py-2">Totals</td>
                  <td className="px-4 py-2">
                    {daily.reduce((s, r) => s + r.messages, 0)}
                  </td>
                  <td className="px-4 py-2">
                    {daily.reduce((s, r) => s + r.tokens, 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    $
                    {daily
                      .reduce((s, r) => s + r.cost, 0)
                      .toFixed(4)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="text-xs uppercase text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}