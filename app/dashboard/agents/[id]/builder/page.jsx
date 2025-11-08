"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { LANGUAGES } from "@/lib/languages";

/**
 * Agent Builder – Knowledge Base + Language
 * Self-contained client page that:
 *  - Pulls agentId from the URL
 *  - Loads agent record to initialize language
 *  - Lists/creates/deletes knowledge items (text, URL, file)
 *  - Saves language via PATCH /api/agents/:id
 *
 * NOTE: This page intentionally has **no** Live Preview on the right.
 */

export default function BuilderPage() {
  const params = useParams();
  const agentId = params?.id;

  // Agent info (for language selector)
  const [agent, setAgent] = useState(null);
  const [language, setLanguage] = useState("English");
  const [savingLang, setSavingLang] = useState(false);
  const [langMsg, setLangMsg] = useState("");

  // Knowledge items state
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // text/url form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");

  // Load agent record (for initial language)
  useEffect(() => {
    let cancelled = false;
    async function loadAgent() {
      if (!agentId) return;
      try {
        setError("");
        const res = await fetch(`/api/agents/${agentId}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load agent");
        if (!cancelled) {
          setAgent(data);
          setLanguage(data?.language || "English");
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load agent");
      }
    }
    loadAgent();
    return () => {
      cancelled = true;
    };
  }, [agentId]);

  // Load knowledge items
  useEffect(() => {
    let cancelled = false;
    async function loadKB() {
      if (!agentId) return;
      try {
        setError("");
        const res = await fetch(`/api/agents/${agentId}/knowledge`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load knowledge");
        if (!cancelled) setEntries(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load knowledge");
      }
    }
    loadKB();
    return () => {
      cancelled = true;
    };
  }, [agentId]);

  async function saveLanguage() {
    if (!agentId) return;
    setSavingLang(true);
    setLangMsg("");
    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to save language");
      setLangMsg("Saved.");
    } catch (err) {
      setLangMsg(err.message || "Failed to save language");
    } finally {
      setSavingLang(false);
      setTimeout(() => setLangMsg(""), 2000);
    }
  }

  // Add plain text snippet
  async function addText(e) {
    e.preventDefault();
    if (!agentId || !content.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/agents/${agentId}/knowledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title || undefined, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Add entry failed");
      setEntries((p) => [data, ...p]);
      setTitle("");
      setContent("");
    } catch (err) {
      setError(err.message || "Add entry failed");
    } finally {
      setLoading(false);
    }
  }

  // Add URL (server fetch + extract)
  async function addUrl(e) {
    e.preventDefault();
    if (!agentId || !url.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/agents/${agentId}/knowledge/url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, title: title || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Add URL failed");
      setEntries((p) => [data, ...p]);
      setUrl("");
      setTitle("");
    } catch (err) {
      setError(err.message || "Add URL failed");
    } finally {
      setLoading(false);
    }
  }

  // Upload a file (PDF/DOCX/PPTX/TXT)
  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!agentId || !file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/agents/${agentId}/knowledge/upload`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      setEntries((p) => [data, ...p]);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      // reset file input so selecting the same file again fires onChange
      e.target.value = "";
    }
  }

  // Delete an entry
  async function removeEntry(id) {
    if (!agentId || !id) return;
    if (!confirm("Delete this knowledge item?")) return;
    try {
      const res = await fetch(
        `/api/agents/${agentId}/knowledge?id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Delete failed");
      setEntries((p) => p.filter((x) => x.id !== id));
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">
          {agent?.name || "Agent"} – Builder
        </h1>
      </div>

      {/* Language selector */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
        <label className="text-sm font-medium text-gray-700">Language</label>
        <div className="flex gap-2">
          <select
            className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={!agentId}
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <button
            onClick={saveLanguage}
            disabled={savingLang || !agentId}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {savingLang ? "Saving..." : "Save"}
          </button>
        </div>
        {langMsg && <div className="text-xs text-gray-500">{langMsg}</div>}
        <p className="text-xs text-gray-500">
          Forces the model to reply in the selected language.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Text add */}
      <form
        onSubmit={addText}
        className="rounded-lg border border-gray-200 bg-white p-4 space-y-2"
      >
        <input
          type="text"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
          disabled={!agentId}
        />
        <textarea
          rows={3}
          placeholder="Paste or write information here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
          disabled={!agentId}
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || !agentId}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add Entry"}
          </button>
        </div>
      </form>

      {/* URL add */}
      <form
        onSubmit={addUrl}
        className="rounded-lg border border-gray-200 bg-white p-4 space-y-3"
      >
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="https://example.com/article"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm"
            disabled={!agentId}
          />
          <button
            type="submit"
            disabled={loading || !url.trim() || !agentId}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add URL"}
          </button>
        </div>
        <p className="text-xs text-gray-500">
          We will fetch the page and extract text server‑side.
        </p>
      </form>

      {/* File upload */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
        <label className="text-sm font-medium text-gray-700">Upload file</label>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain"
            onChange={handleUpload}
            disabled={!agentId}
          />
          <span className="text-xs text-gray-500">PDF, DOCX/PPTX, or TXT</span>
        </div>
        {uploading && <div className="text-xs text-gray-500">Uploading…</div>}
      </div>

      {/* Entries list */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">Knowledge Items</h3>
        {entries.length === 0 ? (
          <p className="text-sm text-gray-500">No entries yet.</p>
        ) : (
          <ul className="space-y-2">
            {entries.map((e) => (
              <li
                key={e.id}
                className="flex justify-between gap-4 rounded-lg border border-gray-200 bg-white p-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs rounded bg-gray-100 px-2 py-0.5 text-gray-700">
                      {e.type || e.sourceType || "text"}
                    </span>
                    <span className="font-medium text-gray-800 truncate">
                      {e.title || e.filename || "Untitled"}
                    </span>
                  </div>
                  {e.url && (
                    <a
                      href={e.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-xs text-indigo-600 hover:underline truncate"
                    >
                      {e.url}
                    </a>
                  )}
                  {e.content && (
                    <p className="mt-1 text-xs text-gray-600 whitespace-pre-wrap line-clamp-3">
                      {e.content.slice(0, 500)}
                      {e.content.length > 500 ? "…" : ""}
                    </p>
                  )}
                </div>
                <div className="shrink-0">
                  <button
                    onClick={() => removeEntry(e.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}