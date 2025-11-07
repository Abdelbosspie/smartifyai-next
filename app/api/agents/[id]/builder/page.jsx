"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

// --- Builder Page Header ---
function BuilderPageHeader() {
  const { data: session } = useSession();
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    async function checkPlan() {
      try {
        const res = await fetch("/api/subscription");
        const data = await res.json();
        setIsPaid(data?.active || false);
      } catch {
        setIsPaid(false);
      }
    }
    checkPlan();
  }, []);

  return (
    <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg border border-gray-200">
      <h1 className="text-xl font-semibold text-gray-800">Agent Builder</h1>
      <button
        disabled={!isPaid}
        className={`rounded-lg px-4 py-2 text-sm font-medium ${
          isPaid
            ? "bg-indigo-600 text-white hover:bg-indigo-700"
            : "bg-gray-200 text-gray-500 cursor-not-allowed"
        }`}
        onClick={() => alert("Agent published successfully!")}
      >
        Publish Agent
      </button>
    </div>
  );
}

// --- Knowledge Base Tab ---
function KnowledgeBase({ agent }) {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  // Fetch existing knowledge entries
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/agents/${agent.id}/knowledge`);
        if (!res.ok) throw new Error("Failed to load knowledge base");
        const data = await res.json();
        setEntries(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    })();
  }, [agent.id]);

  // Add manual knowledge entry
  async function addEntry(e) {
    e.preventDefault();
    if (!newEntry.content.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/agents/${agent.id}/knowledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      });
      if (!res.ok) throw new Error("Failed to add entry");
      const saved = await res.json();
      setEntries((prev) => [saved, ...prev]);
      setNewEntry({ title: "", content: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // File upload (PDF)
  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // You’ll later implement PDF upload in /api/upload
      const res = await fetch(`/api/upload`, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      alert(`File processed: ${data.filename}`);
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Knowledge Base</h2>
      <p className="text-sm text-gray-500">
        Add text entries or upload PDFs to train your agent.
      </p>

      {/* Add Entry */}
      <form onSubmit={addEntry} className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
        <input
          type="text"
          placeholder="Title (optional)"
          value={newEntry.title}
          onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
        />
        <textarea
          rows="3"
          placeholder="Paste or write information here..."
          value={newEntry.content}
          onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
        />
        <div className="flex justify-between items-center">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Add Entry"}
          </button>

          <label className="cursor-pointer text-sm text-indigo-600 hover:underline">
            {uploading ? "Uploading..." : "Upload PDF"}
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </form>

      {/* List Entries */}
      {entries.length > 0 ? (
        <div className="space-y-3">
          {entries.map((e) => (
            <div
              key={e.id}
              className="rounded-lg border border-gray-200 bg-white p-3 text-sm"
            >
              <div className="font-medium text-gray-800">{e.title}</div>
              <div className="text-gray-600 text-xs whitespace-pre-wrap mt-1">
                {e.content.length > 300
                  ? e.content.slice(0, 300) + "..."
                  : e.content}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No entries yet.</p>
      )}
    </div>
  );
}

// Render BuilderPageHeader above KnowledgeBase in the export or parent component as needed
// --- Functions Tab ---
function Functions({ agent, setAgent }) {
  const [functions, setFunctions] = useState([
    { id: 1, name: "Check Calendar", description: "Checks available time slots" },
    { id: 2, name: "End Conversation", description: "Ends chat politely" },
  ]);

  const [newFn, setNewFn] = useState({ name: "", description: "" });

  function addFunction(e) {
    e.preventDefault();
    if (!newFn.name.trim()) return;
    setFunctions((prev) => [
      ...prev,
      { id: Date.now(), ...newFn },
    ]);
    setNewFn({ name: "", description: "" });
  }

  function removeFunction(id) {
    setFunctions((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Functions</h2>
      <p className="text-sm text-gray-500">
        Define custom actions your AI can perform during conversations.
      </p>

      <form onSubmit={addFunction} className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
        <input
          type="text"
          placeholder="Function name"
          value={newFn.name}
          onChange={(e) => setNewFn({ ...newFn, name: e.target.value })}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
        />
        <textarea
          rows="2"
          placeholder="Short description"
          value={newFn.description}
          onChange={(e) => setNewFn({ ...newFn, description: e.target.value })}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
        >
          + Add Function
        </button>
      </form>

      <div className="space-y-3">
        {functions.map((f) => (
          <div
            key={f.id}
            className="flex justify-between items-start rounded-lg border border-gray-200 bg-white p-3"
          >
            <div>
              <div className="font-medium text-gray-800">{f.name}</div>
              <div className="text-sm text-gray-600">{f.description}</div>
            </div>
            <button
              onClick={() => removeFunction(f.id)}
              className="text-xs text-red-500 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
// --- Chat Panel ---
import { useState, useRef, useEffect } from "react";

function ChatPanel({ agent }) {
  const [messages, setMessages] = useState([
    // Example: { sender: "assistant", text: "Hi, how can I help you?" }
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    const text = input;
    setInput("");
    setMessages((prev) => [
      ...prev,
      { sender: "user", text },
    ]);
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agent?.id, message: text }),
      });
      if (!res.ok) throw new Error("Failed to get response");
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { sender: "assistant", text: data?.response || "..." },
      ]);
    } catch (err) {
      setError("Error: " + (err.message || "Something went wrong"));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[32rem] border border-gray-200 rounded-lg bg-white">
      <div className="flex-shrink-0 px-4 py-2 border-b border-gray-100 font-semibold text-gray-800">
        Live Chat
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-sm text-gray-400 text-center">Start chatting with your agent...</div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-gray-200 text-gray-900 rounded-bl-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>
      <form
        onSubmit={sendMessage}
        className="flex items-center border-t border-gray-100 px-3 py-2 bg-white"
      >
        <input
          type="text"
          className="flex-1 px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending}
        />
        <button
          type="submit"
          className="ml-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
          disabled={sending || !input.trim()}
        >
          Send
        </button>
      </form>
      {error && (
        <div className="text-xs text-red-500 px-4 py-1">{error}</div>
      )}
    </div>
  );
}