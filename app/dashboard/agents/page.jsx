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
        if (list.length === 0) setShowForm(true);
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

  // If type is not Voice, clear any stale voice value
  useEffect(() => {
    if (form.type !== "Voice" && form.voice) {
      setForm((f) => ({ ...f, voice: "" }));
    }
  }, [form.type]);

  // Keep a valid selection when filters change
  useEffect(() => {
    if (!filtered.find((a) => a.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? null);
    }
  }, [filtered, selectedId]);

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

  function handleEdit(agent) {
    if (!agent?.id) return;
    router.push(`/dashboard/agents/${agent.id}/builder`);
  }

  async function handleDelete(agent) {
    try {
      if (!agent?.id) return;
      const phrase = typeof window !== "undefined"
        ? window.prompt('Type "delete-my-agent" to confirm deletion of this agent:')
        : null;
      if (phrase !== "delete-my-agent") return;

      const res = await fetch(`/api/agents/${agent.id}`, { method: "DELETE" });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to delete agent");
      }

      // Remove locally
      setAgents((prev) => prev.filter((a) => a.id !== agent.id));
      // Clear selection; the effect below will auto-select the first item if available
      setSelectedId((cur) => (cur === agent.id ? null : cur));
      if (typeof window !== "undefined") {
        window.alert("Agent deleted.");
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to delete agent.");
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
            onClick={() => {
              setShowForm(true);
              setTimeout(() => {
                const el = document.getElementById("new-agent-name");
                if (el) {
                  el.focus();
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }, 0);
            }}
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
                id="new-agent-name"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                placeholder="e.g., Support Bot"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); createAgent(e); } }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Type
              </label>
              <select
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    type: e.target.value,
                    voice: e.target.value === "Voice" ? f.voice : "",
                  }))
                }
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
                    onEdit={() => handleEdit(agent)}
                    onDelete={() => handleDelete(agent)}
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
            Pick an agent and chat with it in real-time.
          </p>

          {!selected ? (
            <div className="text-sm text-gray-500">No agent selected.</div>
          ) : (
            <ChatPanel agent={selected} />
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

function ChatPanel({ agent }) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content: `You're chatting with ${agent?.name ?? "your agent"}.`,
    },
  ]);

  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `You're chatting with ${agent?.name ?? "your agent"}.`,
      },
    ]);
  }, [agent?.id]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    // optimistic user bubble
    const userMsg = { id: `${Date.now()}-u`, role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agent?.id, message: text }),
      });

      if (!res.ok) {
        throw new Error(`Chat failed (${res.status})`);
      }

      const data = await res.json();
      const reply =
        (typeof data?.reply === "string" && data.reply) ||
        (typeof data?.message === "string" && data.message) ||
        "…";

      const botMsg = { id: `${Date.now()}-a`, role: "assistant", content: reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errMsg = {
        id: `${Date.now()}-e`,
        role: "assistant",
        content: "Sorry — I couldn't reply. Please try again.",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex h-[420px] flex-col">
      <div className="mb-2 text-xs text-gray-500">
        Start the conversation with <span className="font-medium">{agent?.name}</span>.
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              m.role === "user"
                ? "ml-auto bg-indigo-600 text-white"
                : "bg-white text-gray-900 border border-gray-200"
            }`}
          >
            {m.content}
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={`Message ${agent?.name ?? "agent"}...`}
          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
        <button
          onClick={send}
          disabled={sending || !input.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </div>
    </div>
  );
}