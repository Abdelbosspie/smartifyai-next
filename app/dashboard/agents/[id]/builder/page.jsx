"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AgentBuilderPage() {
  const { id } = useParams();
  const router = useRouter();

  const [agent, setAgent] = useState(null);
  const [instructions, setInstructions] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      setErr("");
      const res = await fetch(`/api/agents/${id}`, { cache: "no-store" });
      if (!res.ok) {
        setErr("Failed to load agent.");
        return;
      }
      const data = await res.json();
      setAgent(data);
      setInstructions(data?.instructions || "");
    })();
  }, [id]);

  async function save() {
    if (!id) return;
    setSaving(true);
    setErr("");
    try {
      const res = await fetch(`/api/agents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructions }),
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setAgent(json.agent);
      setSavedAt(new Date());
    } catch (_) {
      setErr("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!agent) {
    return (
      <div className="p-6">
        {err ? <div className="text-sm text-red-600">{err}</div> : "Loading…"}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Agent Builder</h1>
        <button
          className="text-sm text-indigo-600 hover:underline"
          onClick={() => router.push("/dashboard/agents")}
        >
          ← Back to Agents
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold mb-2">System Prompt / Instructions</h3>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Describe your agent’s role, tone, tools, etc…"
          className="h-60 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
        <div className="mt-3 flex items-center gap-3">
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
          {err && <span className="text-xs text-red-600">{err}</span>}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold">Agent</h3>
        <div className="mt-2 space-y-1 text-sm">
          <div><span className="font-medium">Name:</span> {agent.name}</div>
          <div><span className="font-medium">Type:</span> {agent.type}</div>
          {agent.voice && (
            <div><span className="font-medium">Voice:</span> {agent.voice}</div>
          )}
          <div className="text-xs text-gray-500">
            Updated {agent.updatedAt ? new Date(agent.updatedAt).toLocaleString() : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}