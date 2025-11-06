"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AgentCard from "../../components/AgentCard.jsx";

export default function AgentsPage() {
  const router = useRouter();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", type: "Chatbot", voice: "" });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/agents", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load agents (${res.status})`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.agents ?? [];
        setAgents(list);
        setSelectedId(list[0]?.id ?? null);
      } catch (e) {
        setError(e?.message || "Failed to load agents.");
        setAgents([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter(
      (a) =>
        a?.name?.toLowerCase().includes(q) ||
        a?.type?.toLowerCase().includes(q) ||
        a?.voice?.toLowerCase().includes(q)
    );
  }, [agents, query]);

  const selected = useMemo(
    () => filtered.find((a) => a.id === selectedId) ?? null,
    [filtered, selectedId]
  );

  async function createAgent(e) {
    e?.preventDefault?.();
    if (!form.name.trim()) return;

    setCreating(true);
    try {
      const payload = { name: form.name, type: form.type };
      if (form.type === "Voice") {
        payload.voice = form.voice;
      }
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to create agent.");
      }
      const created = await res.json();
      setAgents((prev) => [created, ...prev]);
      setShowForm(false);
      setForm({ name: "", type: "Chatbot", voice: "" });
      setSelectedId(created.id ?? null);
      router.push(`/dashboard/agents/${created.id}/builder`);
      return;
    } catch (err) {
      setError(err?.message || "Failed to create agent.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Agents</h1>
          <p className="text-sm text-gray-500">
            Create, search, and preview your AI agents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search agents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-64 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
          />
          <button
            onClick={() => setShowForm((s) => !s)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + New Agent
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={createAgent}
          className="rounded-xl border border-gray-200 bg-white p-4"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Name
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                placeholder="e.g., Support Bot"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Type
              </label>
              <select
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              >
                <option>Chatbot</option>
                <option>Voice</option>
              </select>
            </div>

            {form.type === "Voice" && (
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Voice (optional)
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                  placeholder="e.g., Allura"
                  value={form.voice}
                  onChange={(e) => setForm((f) => ({ ...f, voice: e.target.value }))}
                />
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create Agent"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-3">
            {loading ? (
              <div className="p-6 text-sm text-gray-500">Loading agents…</div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-sm text-gray-500">
                No agents. Click <strong>+ New Agent</strong> to create one.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {filtered.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    active={selected?.id === agent.id}
                    onSelect={() => setSelectedId(agent.id)}
                  />
                ))}
              </div>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-500">{filtered.length} total</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-semibold">Live Preview</h3>
          <p className="mb-4 text-xs text-gray-500">
            Pick an agent from the list to see its details.
          </p>

          {!selected ? (
            <div className="text-sm text-gray-500">No agent selected.</div>
          ) : (
            <AgentPreview agent={selected} />
          )}
        </div>
      </div>
    </div>
  );
}

function AgentPreview({ agent }) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-gray-200 p-3">
        <div className="text-sm">
          <span className="font-medium">Name:</span> {agent.name}
        </div>
        <div className="text-sm">
          <span className="font-medium">Type:</span> {agent.type || "Chatbot"}
        </div>
        {agent.voice ? (
          <div className="text-sm">
            <span className="font-medium">Voice:</span> {agent.voice}
          </div>
        ) : null}
        <div className="text-sm text-gray-600">
          {agent.messages ?? 0} messages
        </div>
        {agent.updatedAt && (
          <div className="text-xs text-gray-500">
            Updated {new Date(agent.updatedAt).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}