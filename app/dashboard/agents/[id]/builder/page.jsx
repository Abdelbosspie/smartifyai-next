"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { LANGUAGES } from "@/lib/languages";

// ---------- Language helpers ----------
const DEFAULT_LANGUAGES = [
  "English", "Arabic", "Spanish", "French", "German", "Italian", "Portuguese", "Russian",
  "Chinese (Simplified)", "Japanese", "Korean", "Hindi", "Urdu", "Bengali", "Turkish", "Dutch",
  "Polish", "Swedish", "Norwegian", "Danish", "Finnish", "Greek", "Thai", "Vietnamese",
  "Indonesian", "Malay", "Filipino", "Persian", "Hebrew", "Czech", "Romanian", "Hungarian",
  "Ukrainian", "Bulgarian", "Slovak", "Slovenian", "Croatian", "Serbian", "Lithuanian",
  "Latvian", "Estonian", "Tamil", "Telugu", "Marathi", "Gujarati",
];

const RAW_LANGS = Array.isArray(LANGUAGES) && LANGUAGES.length ? LANGUAGES : DEFAULT_LANGUAGES;

// Build normalized options first
const LANG_OPTIONS = RAW_LANGS.map((l) => {
  if (typeof l === "string") return { label: l, value: l };
  if (l && typeof l === "object") {
    const label = l.label ?? l.value;
    const value = l.value ?? l.label;
    if (label && value) return { label, value };
  }
  return null;
}).filter(Boolean);

// Then build the dropdown, prefixed by Auto
const LANGUAGE_DROPDOWN = [
  { label: "Auto-detect (reply in user's language)", value: "auto" },
  ...LANG_OPTIONS,
];

async function parseJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// ---------- Simple Error Boundary ----------
class BuilderErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, err: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, err: error };
  }
  componentDidCatch(error, info) {
    console.error("Builder page error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Something went wrong while loading this page. Please refresh.{" "}
          {this.state.err?.message}
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------- Tiny Accordion (like the screenshot) ----------
function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-medium text-gray-800">{title}</span>
        <span className="text-gray-500">{open ? "▾" : "▸"}</span>
      </button>
      {open && <div className="border-t border-gray-200 p-4">{children}</div>}
    </div>
  );
}

// ---------- Live Preview (right column) ----------
function LivePreview({ agentId, languageHint }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    // reset when agentId changes
    setMessages([]);
    setInput("");
  }, [agentId]);

  useEffect(() => {
    // auto-scroll
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [messages]);

  async function send() {
    const content = input.trim();
    if (!content || !agentId) return;
    const userMsg = { role: "user", content };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          languageHint,
          messages: next,
          preview: true,
        }),
      });
      const data = (await parseJson(res)) || {};
      const reply = data.reply || "Sorry — I couldn’t reply. Please try again.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry — I couldn’t reply. Please try again." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white">
      <div className="px-4 py-3 border-b border-gray-200 text-sm font-medium text-gray-800">
        Test Chat
      </div>
      <div ref={boxRef} className="flex-1 overflow-auto p-4 space-y-2">
        {messages.length === 0 && (
          <p className="text-xs text-gray-500">Type below to test replies.</p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              m.role === "user"
                ? "ml-auto bg-indigo-600 text-white"
                : "mr-auto bg-gray-100 text-gray-800"
            }`}
          >
            {m.content}
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-gray-200 flex gap-2">
        <input
          className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm"
          placeholder="Message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button
          onClick={send}
          disabled={busy || !input.trim()}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          Send
        </button>
      </div>
    </div>
  );
}

// ---------- Main Page ----------
export default function BuilderPage() {
  const params = useParams();
  const rawId = params?.id;
  const agentId = Array.isArray(rawId) ? rawId[0] : (rawId ?? "");
  const router = useRouter();

  // Agent info
  const [agent, setAgent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  // Chat settings (left column)
  const [model, setModel] = useState("gpt-4o-mini");
  const [language, setLanguage] = useState("English");
  const [prompt, setPrompt] = useState("");
  const [welcome, setWelcome] = useState("Hi there! How can I help you?");
  const [aiSpeaksFirst, setAiSpeaksFirst] = useState(false);
  const [dynamicMsgs, setDynamicMsgs] = useState(false);

  // Knowledge items state (middle column & API wiring kept)
  const [entries, setEntries] = useState([]);
  const [loadingKB, setLoadingKB] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorKB, setErrorKB] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");

  // Load agent
  useEffect(() => {
    let cancelled = false;
    async function loadAgent() {
      if (!agentId) return;
      try {
        const res = await fetch(`/api/agents/${agentId}`, { cache: "no-store" });
        const data = await parseJson(res);
        if (!res.ok) throw new Error(data?.error || "Failed to load agent");
        if (!cancelled) {
          setAgent(data);
          setModel(data?.model || "gpt-4o-mini");
          setLanguage(data?.language || "English");
          setPrompt(data?.prompt || "");
          setWelcome(data?.welcome || "Hi there! How can I help you?");
          setAiSpeaksFirst(Boolean(data?.aiSpeaksFirst));
          setDynamicMsgs(Boolean(data?.dynamicMsgs));
        }
      } catch (err) {
        if (!cancelled) {
          setToast(err.message || "Failed to load agent");
        }
      }
    }
    loadAgent();
    return () => {
      cancelled = true;
    };
  }, [agentId]);

  // Load KB
  useEffect(() => {
    let cancelled = false;
    async function loadKB() {
      if (!agentId) return;
      try {
        setErrorKB("");
        setLoadingKB(true);
        const res = await fetch(`/api/agents/${agentId}/knowledge`, { cache: "no-store" });
        const data = await parseJson(res);
        if (!res.ok) throw new Error(data?.error || "Failed to load knowledge");
        if (!cancelled) setEntries(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setErrorKB(err.message || "Failed to load knowledge");
      } finally {
        if (!cancelled) setLoadingKB(false);
      }
    }
    loadKB();
    return () => {
      cancelled = true;
    };
  }, [agentId]);

  // Save (top-right) then go back to Agents list
  async function saveAll() {
    if (!agentId) return;
    setSaving(true);
    setToast("");
    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          language,
          prompt,
          welcome,
          aiSpeaksFirst,
          dynamicMsgs,
        }),
      });
      const data = await parseJson(res);
      if (!res.ok) throw new Error(data?.error || "Save failed");
      setToast("Saved.");
      // After save, route back like you asked
      router.push("/dashboard/agents");
    } catch (err) {
      setToast(err.message || "Save failed");
    } finally {
      setSaving(false);
      setTimeout(() => setToast(""), 2500);
    }
  }

  // Publish
  async function publish() {
    if (!agentId) return;
    setToast("");
    try {
      const res = await fetch(`/api/agents/${agentId}/publish`, { method: "POST" });
      const data = await parseJson(res);
      if (!res.ok) throw new Error(data?.error || "Publish failed");
      setToast("Agent published.");
    } catch (err) {
      setToast(err.message || "Publish failed");
    } finally {
      setTimeout(() => setToast(""), 2500);
    }
  }

  // KB: text
  async function addText(e) {
    e.preventDefault();
    if (!agentId || !content.trim()) return;
    try {
      const res = await fetch(`/api/agents/${agentId}/knowledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title || undefined, content }),
      });
      const data = await parseJson(res);
      if (!res.ok) throw new Error(data?.error || "Add entry failed");
      setEntries((p) => [data, ...p]);
      setTitle("");
      setContent("");
    } catch (err) {
      setErrorKB(err.message || "Add entry failed");
    }
  }

  // KB: URL
  async function addUrl(e) {
    e.preventDefault();
    if (!agentId || !url.trim()) return;
    try {
      const res = await fetch(`/api/agents/${agentId}/knowledge/url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, title: title || undefined }),
      });
      const data = await parseJson(res);
      if (!res.ok) throw new Error(data?.error || "Add URL failed");
      setEntries((p) => [data, ...p]);
      setUrl("");
      setTitle("");
    } catch (err) {
      setErrorKB(err.message || "Add URL failed");
    }
  }

  // KB: Upload
  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!agentId || !file) return;
    setUploading(true);
    setErrorKB("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/agents/${agentId}/knowledge/upload`, {
        method: "POST",
        body: fd,
      });
      const data = await parseJson(res);
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      setEntries((p) => [data, ...p]);
    } catch (err) {
      setErrorKB(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  // KB: Delete
  async function removeEntry(id) {
    if (!agentId || !id) return;
    if (!confirm("Delete this knowledge item?")) return;
    try {
      const res = await fetch(
        `/api/agents/${agentId}/knowledge?id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      const data = (await parseJson(res)) || {};
      if (!res.ok) throw new Error(data?.error || "Delete failed");
      setEntries((p) => p.filter((x) => x.id !== id));
    } catch (err) {
      setErrorKB(err.message || "Delete failed");
    }
  }

  return (
    <BuilderErrorBoundary>
      <div className="space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">
            {agent?.name || "Agent"} — Builder
          </h1>
          <div className="flex gap-2">
            <button
              onClick={publish}
              className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              Publish
            </button>
            <button
              onClick={saveAll}
              disabled={saving}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
        {toast && (
          <div className="rounded-md border border-gray-200 bg-white p-2 text-xs text-gray-700">
            {toast}
          </div>
        )}

        {/* 3-column layout like your screenshot */}
        <div className="grid grid-cols-12 gap-4">
          {/* LEFT: Chat Settings */}
          <div className="col-span-12 lg:col-span-6 space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
              {/* Row: Model + Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Model</label>
                  <select
                    className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    disabled={!agentId}
                  >
                    <option value="gpt-4o-mini">GPT‑4o mini</option>
                    <option value="gpt-4o">GPT‑4o</option>
                    <option value="gpt-4.1">GPT‑4.1</option>
                    <option value="gpt-3.5-turbo">GPT‑3.5 Turbo</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Language</label>
                  <select
                    className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    disabled={!agentId}
                  >
                    {LANGUAGE_DROPDOWN.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-gray-500">Replies will use this language. Choose “Auto” to mirror the user’s language.</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Universal Prompt</label>
                <textarea
                  rows={8}
                  placeholder="Type a universal prompt for your agent…"
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={!agentId}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Welcome Message</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  value={welcome}
                  onChange={(e) => setWelcome(e.target.value)}
                  disabled={!agentId}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-800">
                  <input
                    type="checkbox"
                    checked={aiSpeaksFirst}
                    onChange={(e) => setAiSpeaksFirst(e.target.checked)}
                    disabled={!agentId}
                  />
                  AI speaks first
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-800">
                  <input
                    type="checkbox"
                    checked={dynamicMsgs}
                    onChange={(e) => setDynamicMsgs(e.target.checked)}
                    disabled={!agentId}
                  />
                  Dynamic message
                </label>
              </div>
            </div>
          </div>

          {/* MIDDLE: Accordions (Knowledge Base active, others placeholders) */}
          <div className="col-span-12 lg:col-span-3 space-y-3">
            <Accordion title="Functions">
              <p className="text-sm text-gray-600">Coming soon.</p>
            </Accordion>

            <Accordion title="Knowledge Base" defaultOpen>
              {errorKB && (
                <div className="mb-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {errorKB}
                </div>
              )}

              {/* Text add */}
              <form onSubmit={addText} className="space-y-2">
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
                  placeholder="Paste or write information here…"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  disabled={!agentId}
                />
                <button
                  type="submit"
                  disabled={!content.trim()}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-60"
                >
                  Add Entry
                </button>
              </form>

              {/* URL add */}
              <form onSubmit={addUrl} className="mt-3 space-y-2">
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
                    disabled={!url.trim()}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-60"
                  >
                    Add URL
                  </button>
                </div>
                <p className="text-xs text-gray-500">We’ll fetch the page and extract text server‑side.</p>
              </form>

              {/* File upload */}
              <div className="mt-3 space-y-2">
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
              <div className="mt-3 space-y-2">
                <h4 className="text-xs font-semibold text-gray-900">Knowledge Items</h4>
                {loadingKB ? (
                  <p className="text-xs text-gray-500">Loading…</p>
                ) : entries.length === 0 ? (
                  <p className="text-xs text-gray-500">No entries yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {entries.map((e) => (
                      <li
                        key={e.id}
                        className="flex justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50 p-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] rounded bg-white px-2 py-0.5 text-gray-700 border border-gray-200">
                              {e.type || e.sourceType || "text"}
                            </span>
                            <span className="text-sm font-medium text-gray-800 truncate">
                              {e.title || e.filename || "Untitled"}
                            </span>
                          </div>
                          {e.url && (
                            <a
                              href={e.url}
                              target="_blank"
                              rel="noreferrer"
                              className="block text-[11px] text-indigo-600 hover:underline truncate"
                            >
                              {e.url}
                            </a>
                          )}
                          {e.content && (
                            <p className="mt-1 text-[11px] text-gray-600 whitespace-pre-wrap line-clamp-3">
                              {e.content.slice(0, 400)}
                              {e.content.length > 400 ? "…" : ""}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 pl-2">
                          <button
                            onClick={() => removeEntry(e.id)}
                            className="text-[11px] text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Accordion>

            <Accordion title="Post‑Chat Analysis">
              <p className="text-sm text-gray-600">Coming soon.</p>
            </Accordion>

            <Accordion title="Security &amp; Fallback Settings">
              <p className="text-sm text-gray-600">Coming soon.</p>
            </Accordion>

            <Accordion title="Webhook Settings">
              <p className="text-sm text-gray-600">Coming soon.</p>
            </Accordion>

            <Accordion title="MCPs">
              <p className="text-sm text-gray-600">Coming soon.</p>
            </Accordion>
          </div>

          {/* RIGHT: Live preview */}
          <div className="col-span-12 lg:col-span-3">
            <LivePreview agentId={agentId} languageHint={language} />
          </div>
        </div>
      </div>
    </BuilderErrorBoundary>
  );
}