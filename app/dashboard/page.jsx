"use client";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { useEffect, useMemo, useState } from "react";
import AgentCard from "../components/AgentCard";
import PreviewPanel from "../components/PreviewPanel";

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-5">
      <p className="text-xs md:text-sm text-gray-500">{label}</p>
      <div className="mt-1 flex items-end gap-2">
        <span className="text-2xl md:text-3xl font-semibold text-gray-900">{value}</span>
        {sub ? <span className="text-xs text-gray-400">{sub}</span> : null}
      </div>
    </div>
  );
}

export default function Page() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch("/api/agents", { cache: "no-store" });
        const data = await res.json();
        if (!ignore) {
          const list = Array.isArray(data) ? data : Array.isArray(data?.agents) ? data.agents : [];
          setAgents(list);
          setSelected(list[0] || null);
        }
      } catch {
        setAgents([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  async function createAgent() {
    if (creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Agent", type: "Chatbot" }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const newAgent = data?.agent ?? data;
      setAgents((prev) => [newAgent, ...(Array.isArray(prev) ? prev : [])]);
      setSelected(newAgent);
    } catch (e) {
      console.error("Create agent failed:", e);
      alert("Could not create agent. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  const stats = useMemo(() => {
    const totalAgents = agents.length;
    const totalMessages = agents.reduce((sum, a) => sum + (a.messages || 0), 0);
    const voiceAgents = agents.filter((a) => (a.type || "").toLowerCase().includes("voice")).length;
    const chatAgents = agents.filter((a) => (a.type || "").toLowerCase().includes("chat")).length;
    return { totalAgents, totalMessages, voiceAgents, chatAgents };
  }, [agents]);

  return (
    <div className="space-y-6">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <h2 className="text-sm font-medium text-gray-900">Dashboard</h2>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatCard label="Total Agents" value={stats.totalAgents} />
        <StatCard label="Total Messages" value={stats.totalMessages} />
        <StatCard label="Voice Agents" value={stats.voiceAgents} />
        <StatCard label="Chat Agents" value={stats.chatAgents} />
      </section>

      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-12 xl:col-span-7 2xl:col-span-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">All Agents</h2>
            <span className="text-xs text-gray-500">{stats.totalAgents} total</span>
          </div>
          <div className="mb-4 flex items-center gap-2">
            <input
              type="search"
              placeholder="Search agents…"
              className="h-10 w-48 md:w-64 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-indigo-400"
              onChange={(e) => {
                const q = e.target.value.toLowerCase();
                setSelected(null);
                setAgents((prev) =>
                  Array.isArray(prev)
                    ? prev.map((a) => ({
                        ...a,
                        _hidden: !(`${a.name || ""} ${a.type || ""}`.toLowerCase().includes(q)),
                      }))
                    : []
                );
              }}
            />
            <button
              onClick={createAgent}
              className="h-10 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              disabled={creating}
            >
              {creating ? "Creating..." : "+ New Agent"}
            </button>
          </div>

          {loading ? (
            <div className="h-40 rounded-xl border border-gray-200 bg-white animate-pulse" />
          ) : agents.filter((a) => !a._hidden).length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-600">
              No agents yet. Click <span className="font-medium">+ New Agent</span> to create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents
                .filter((a) => !a._hidden)
                .map((a) => (
                  <AgentCard
                    key={a.id}
                    agent={a}
                    active={selected?.id === a.id}
                    onSelect={() => setSelected(a)}
                  />
                ))}
            </div>
          )}
        </section>

        <aside className="col-span-12 xl:col-span-5 2xl:col-span-4">
          <div className="rounded-xl border border-gray-200 bg-white">
            {selected ? (
              <PreviewPanel agent={selected} />
            ) : (
              <div className="p-8 text-center text-gray-600">
                <p className="font-medium">Select an agent to preview</p>
                <p className="text-sm text-gray-500 mt-1">
                  Pick an agent from the list to see its live preview here.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}