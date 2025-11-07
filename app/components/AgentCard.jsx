"use client";
import React, { useEffect, useRef, useState } from "react";

export default function AgentCard({ agent, active, onSelect, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  const handleEdit = (e) => {
    e.stopPropagation();
    setOpen(false);
    onEdit?.(agent);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setOpen(false);
    const phrase = window.prompt('Type "delete-my-agent" to confirm deletion');
    if (phrase !== "delete-my-agent") return;
    await onDelete?.(agent);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.();
        }
      }}
      className={`group relative cursor-pointer rounded-lg border p-3 bg-white hover:border-indigo-300 ${
        active ? "border-indigo-500 ring-2 ring-indigo-100" : "border-gray-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold">
          {(agent?.name || "?").slice(0, 1).toUpperCase()}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="font-medium text-gray-900">{agent?.name}</div>

            <div ref={menuRef} className="relative">
              <button
                aria-label="More"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((o) => !o);
                }}
                className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100"
              >
                ⋯
              </button>

              {open && (
                <div className="absolute right-0 z-10 mt-2 w-36 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
                  <button
                    onClick={handleEdit}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-1 text-xs text-gray-500">
            {(agent?.type || "Chatbot")} · {(agent?.messages ?? 0)} msgs
          </div>
          {agent?.updatedAt && (
            <div className="mt-0.5 text-[11px] text-gray-400">
              Updated {new Date(agent.updatedAt).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}