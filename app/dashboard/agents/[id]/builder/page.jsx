"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AgentBuilderPage() {
  const { id } = useParams();
  const router = useRouter();

  const [agent, setAgent] = useState(null);
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`/api/agents/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load agent (${res.status})`);
        const data = await res.json();
        if (cancelled) return;
        setAgent(data);
        setInstructions(data?.instructions || "");
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load agent.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (id) load();
    return () => { cancelled = true; };
  }, [id]);

  async function save() {
    try {
      setSaving(true);
      setError("");
      const res = await fetch(`/api/agents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructions }),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      const json = await res.json();
      setAgent(json.agent);
      setSavedAt(new Date());
    } catch (e) {
      setError(e?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!agent) return <div className="p-6">Agent not found.</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{agent.name} • Builder</h1>
        <button
          onClick={() => router.push("/dashboard/agents")}
          className="rounded-lg border px-3 py-1.5 text-sm"
        >
          ← Back to Agents
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <label className="text-sm font-medium">System Prompt / Instructions</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Describe your agent’s role, tone, tools, etc…"
            className="h-[360px] w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:border-indigo-400"
          />
          <div className="flex gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Prompt"}
            </button>
            {savedAt && (
              <span className="text-xs text-gray-500">
                Saved {savedAt.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-semibold">Agent</h3>
          <div className="mt-2 space-y-1 text-sm">
            <div><span className="font-medium">Name:</span> {agent.name}</div>
            <div><span className="font-medium">Type:</span> {agent.type}</div>
            {agent.voice && <div><span className="font-medium">Voice:</span> {agent.voice}</div>}
            <div className="text-xs text-gray-500">
              Updated {new Date(agent.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}