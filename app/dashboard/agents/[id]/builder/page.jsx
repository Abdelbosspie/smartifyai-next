"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import { Switch } from "@headlessui/react";

export default function AgentBuilderPage() {
  const { id } = useParams();
  const [agent, setAgent] = useState(null);
  const [activeTab, setActiveTab] = useState("chat");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch agent info
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/agents/${id}`);
        if (!res.ok) throw new Error("Failed to load agent");
        const data = await res.json();
        setAgent(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load agent.");
      }
    })();
  }, [id]);

  if (!agent) {
    return (
      <div className="p-8 text-gray-500 text-sm">
        {error ? error : "Loading agent..."}
      </div>
    );
  }

  // Tab Components
  const tabs = [
    { id: "chat", label: "Chat Settings" },
    { id: "knowledge", label: "Knowledge Base" },
    { id: "functions", label: "Functions" },
    { id: "appearance", label: "Appearance" },
  ];

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/agents/${id}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agent),
      });
      if (!res.ok) throw new Error("Failed to save agent");
      alert("Agent saved successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top bar */}
      <div className="flex justify-between items-center border-b bg-white px-6 py-3 shadow-sm">
        <h1 className="text-lg font-semibold">
          {agent.name || "Untitled Agent"}
        </h1>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => alert("Upgrade required to publish")}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Publish
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-white">
          <nav className="flex flex-col">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-left text-sm font-medium ${
                  activeTab === tab.id
                    ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === "chat" && <ChatSettings agent={agent} setAgent={setAgent} />}
          {activeTab === "knowledge" && <KnowledgeBasePanel agent={agent} />}
          {activeTab === "functions" && <Functions />}
          {activeTab === "appearance" && <Appearance />}
        </main>

        {/* Live Preview */}
        <aside className="w-96 border-l bg-white p-4">
          <h3 className="text-sm font-semibold mb-2">Live Preview</h3>
          <div className="border rounded-lg p-3 text-sm text-gray-500 h-[500px] overflow-y-auto">
            Test chat with {agent.name} will appear here.
          </div>
        </aside>
      </div>
    </div>
  );
}

// --- Chat Settings Tab ---
function ChatSettings({ agent, setAgent }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Model</label>
        <select
          value={agent.model || "gpt-4-turbo"}
          onChange={(e) => setAgent({ ...agent, model: e.target.value })}
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
        >
          <option value="gpt-4-turbo">GPT-4 Turbo</option>
          <option value="gpt-4o-mini">GPT-4o Mini</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Language</label>
        <input
          value={agent.language || "English"}
          onChange={(e) => setAgent({ ...agent, language: e.target.value })}
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Universal Prompt
        </label>
        <textarea
          rows="3"
          value={agent.prompt || ""}
          onChange={(e) => setAgent({ ...agent, prompt: e.target.value })}
          placeholder="e.g. You are a friendly AI assistant helping with customer queries."
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Welcome Message
        </label>
        <input
          value={agent.welcome || ""}
          onChange={(e) => setAgent({ ...agent, welcome: e.target.value })}
          placeholder="Hi there! How can I help you?"
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex items-center gap-3">
        <Switch
          checked={agent.aiSpeaksFirst || false}
          onChange={(v) => setAgent({ ...agent, aiSpeaksFirst: v })}
          className={`${
            agent.aiSpeaksFirst ? "bg-indigo-600" : "bg-gray-200"
          } relative inline-flex h-6 w-11 items-center rounded-full`}
        >
          <span
            className={`${
              agent.aiSpeaksFirst ? "translate-x-6" : "translate-x-1"
            } inline-block h-4 w-4 transform rounded-full bg-white transition`}
          />
        </Switch>
        <span className="text-sm text-gray-700">AI Speaks First</span>
      </div>
    </div>
  );
}

// --- Knowledge Base Tab (inline to avoid missing import) ---
function KnowledgeBasePanel({ agent }) {
  const [entries, setEntries] = React.useState([]);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");

  const [url, setUrl] = React.useState("");
  const [uploading, setUploading] = React.useState(false);

  async function refresh() {
    try {
      const res = await fetch(`/api/agents/${agent.id}/knowledge`, {
        method: "GET",
      });
      if (!res.ok) throw new Error("Failed to load knowledge list");
      const data = await res.json();
      // support either array or {items:[...]}
      setEntries(Array.isArray(data) ? data : data.items || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load knowledge");
    }
  }

  React.useEffect(() => {
    if (agent?.id) {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent?.id]);

  async function addText(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/agents/${agent.id}/knowledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title || null, content }),
      });
      if (!res.ok) throw new Error("Failed to add entry");
      setTitle("");
      setContent("");
      await refresh();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to add entry");
    } finally {
      setLoading(false);
    }
  }

  async function addUrl(e) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/agents/${agent.id}/knowledge/url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error("Failed to add URL");
      setUrl("");
      await refresh();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to add URL");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/agents/${agent.id}/knowledge/upload`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      await refresh();
    } catch (err) {
      console.error(err);
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      // reset input so same file can be reselected
      e.target.value = "";
    }
  }

  async function removeEntry(id) {
    if (!confirm("Delete this knowledge item?")) return;
    try {
      const res = await fetch(
        `/api/agents/${agent.id}/knowledge?id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete");
      await refresh();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete");
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Upload PDFs, DOCX/PPTX, add URLs, or paste text to enrich your agent.
      </p>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* Add text block */}
      <form onSubmit={addText} className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
        <textarea
          rows={3}
          placeholder="Paste or write information here…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Saving…" : "Add Entry"}
        </button>
      </form>

      {/* URL add */}
      <form onSubmit={addUrl} className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
        <div className="flex gap-3">
          <input
            type="url"
            placeholder="https://example.com/article"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={loading || !url}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Adding…" : "Add URL"}
          </button>
        </div>
      </form>

      {/* File upload */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <label className="text-sm font-medium text-gray-700">Upload file</label>
        <div className="mt-2 flex items-center gap-3">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
            onChange={handleUpload}
            className="text-sm"
          />
          <span className="text-xs text-gray-500">
            {uploading ? "Uploading…" : "PDF, DOCX, PPTX, or TXT"}
          </span>
        </div>
      </div>

      {/* List entries */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">Knowledge Items</h3>
        {entries.length === 0 ? (
          <p className="text-sm text-gray-500">No entries yet.</p>
        ) : (
          <div className="space-y-3">
            {entries.map((k) => (
              <div
                key={k.id}
                className="rounded-lg border border-gray-200 bg-white p-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      {k.title || k.filename || "Untitled"}
                    </div>
                    <div className="mt-1 text-xs text-gray-600 whitespace-pre-wrap">
                      {k.content ? (k.content.length > 220 ? k.content.slice(0, 220) + "…" : k.content) : (k.url || "")}
                    </div>
                  </div>
                  <button
                    onClick={() => removeEntry(k.id)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Functions Tab (temporary placeholder) ---
function Functions() {
  return (
    <div className="text-sm text-gray-500">
      Define custom actions your AI can perform. (Coming soon)
    </div>
  );
}

function Appearance() {
  return (
    <div className="text-sm text-gray-500">
      Customize your agent’s look and tone. (Coming soon)
    </div>
  );
}