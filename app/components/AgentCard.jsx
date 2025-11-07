"use client";

import React from "react";
import { useRouter } from "next/navigation";

/* ---------- tiny helpers ---------- */
function KebabMenu({ onEdit, onDelete }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="More actions"
        onClick={() => setOpen(v => !v)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
      >
        ⋮
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-36 rounded-md border border-gray-200 bg-white shadow">
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
            onClick={() => {
              setOpen(false);
              onEdit?.();
            }}
          >
            Edit
          </button>

          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            onClick={() => {
              setOpen(false);
              onDelete?.();
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function ConfirmDeleteModal({ open, onClose, onConfirm, agentName }) {
  const [text, setText] = React.useState("");
  const CODE = "delete-my-agent";
  const ok = text.trim() === CODE;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-5">
        <h3 className="text-lg font-semibold">Delete “{agentName}”?</h3>
        <p className="mt-2 text-sm text-gray-600">
          This action is permanent. To confirm, type{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5">{CODE}</code>.
        </p>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={CODE}
          className="mt-3 w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!ok}
            onClick={onConfirm}
            className={`rounded-md px-3 py-1.5 text-sm ${
              ok
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-red-200 text-white cursor-not-allowed"
            }`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- the card ---------- */
export default function AgentCard({ agent }) {
  const router = useRouter();
  const [showDelete, setShowDelete] = React.useState(false);

  async function handleDelete() {
    try {
      const res = await fetch(`/api/agents/${agent.id}`, { method: "DELETE" });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`Delete failed: ${res.status} ${t}`);
      }
      // simplest refresh
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Failed to delete agent.");
    } finally {
      setShowDelete(false);
    }
  }

  return (
    <div className="relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {/* 3-dots */}
      <div className="absolute right-2 top-2">
        <KebabMenu
          onEdit={() => router.push(`/dashboard/agents/${agent.id}/builder`)}
          onDelete={() => setShowDelete(true)}
        />
      </div>

      {/* card content (keep whatever you already show) */}
      <h2 className="text-lg font-semibold text-gray-900">{agent.name}</h2>
      <p className="text-sm text-gray-600">{agent.type} • {agent.model || "gpt-3.5-turbo"}</p>
      <p className="mt-1 text-xs text-gray-500">Updated {new Date(agent.updatedAt).toLocaleString()}</p>

      {/* confirm modal */}
      <ConfirmDeleteModal
        open={showDelete}
        agentName={agent.name}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}