"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Agents List
 * - Loads agents from /api/agents
 * - Click a card to select it (for visual feedback)
 * - Kebab menu (⋯) per card: Edit, Delete
 * - Delete requires typing: delete-my-agent
 * - Defensive coding to avoid client crashes
 */

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [openMenuFor, setOpenMenuFor] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setErr("");
        const res = await fetch("/api/agents", { cache: "no-store" });
        // Handle non-JSON responses gracefully
        let data = [];
        try {
          data = await res.json();
        } catch {
          data = [];
        }
        if (!res.ok) throw new Error((data && data.error) || "Failed to load agents");
        if (!Array.isArray(data)) data = [];
        if (!cancelled) {
          setAgents(data);
          setActiveId(data[0]?.id ?? null);
        }
      } catch (e) {
        if (!cancelled) setErr(e?.message || "Failed to load agents");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function toggleMenu(id, e) {
    e?.stopPropagation?.();
    setOpenMenuFor((prev) => (prev === id ? null : id));
  }

  async function handleDelete(agent, e) {
    e?.stopPropagation?.();
    // 2FA-style confirmation
    const input = window.prompt(
      `Type "delete-my-agent" to permanently delete "${agent?.name || "agent"}".`
    );
    if (input !== "delete-my-agent") return;

    try {
      const res = await fetch(`/api/agents/${agent.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Delete failed");

      setAgents((prev) => {
        const next = prev.filter((a) => a.id !== agent.id);
        // fix active selection if we deleted the active card
        if (activeId === agent.id) {
          setActiveId(next[0]?.id || null);
        }
        return next;
      });

      setOpenMenuFor(null);
    } catch (e2) {
      alert(e2?.message || "Delete failed");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Agents</h1>
        <Link
          href="/dashboard/agents/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
        >
          + New Agent
        </Link>
      </div>

      {err && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : agents.length === 0 ? (
        <div className="text-sm text-gray-500">No agents yet. Click “+ New Agent”.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((a) => (
            <div
              key={a.id}
              role="button"
              tabIndex={0}
              onClick={() => setActiveId(a.id)}
              onKeyDown={(e) => e.key === "Enter" && setActiveId(a.id)}
              className={`rounded-lg border bg-white p-4 outline-none transition ${
                activeId === a.id
                  ? "border-indigo-400 ring-2 ring-indigo-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">{a.name || "Untitled"}</div>
                  <div className="text-xs text-gray-500">
                    {(a.type || "Chatbot") + (a.messagesCount ? ` • ${a.messagesCount} msgs` : "")}
                  </div>
                </div>

                <div className="relative shrink-0">
                  <button
                    aria-label="More"
                    className="rounded p-1 text-gray-500 hover:bg-gray-100"
                    onClick={(e) => toggleMenu(a.id, e)}
                  >
                    ⋯
                  </button>
                  {openMenuFor === a.id && (
                    <div className="absolute right-0 z-10 mt-1 w-36 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
                      <Link
                        href={`/dashboard/agents/${a.id}/builder`}
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Edit
                      </Link>
                      <button
                        className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                        onClick={(e) => handleDelete(a, e)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}