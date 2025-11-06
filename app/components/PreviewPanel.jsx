"use client";
import { useEffect, useRef, useState } from "react";

export default function PreviewPanel({ agent }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (!agent?.id) return;
    (async () => {
      const res = await fetch(`/api/agents/${agent.id}/messages`, { cache: "no-store" });
      const data = await res.json();
      setMessages(Array.isArray(data?.messages) ? data.messages : []);
      // scroll to bottom
      setTimeout(() => listRef.current?.scrollTo({ top: 999999 }), 0);
    })();
  }, [agent?.id]);

  async function onSend(e) {
    e.preventDefault();
    if (!input.trim() || !agent?.id) return;

    const text = input.trim();
    setInput("");

    // optimistic add user message
    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, { id: tempId, role: "user", content: text }]);
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agent.id, content: text }),
      });
      const data = await res.json();
      setMessages(prev => [
        ...prev.filter(m => m.id !== tempId),
        { id: tempId, role: "user", content: text },
        { id: data?.id ?? `asst-${Date.now()}`, role: "assistant", content: data?.reply ?? "" },
      ]);
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      alert("Failed to send message. Try again.");
    } finally {
      setSending(false);
      setTimeout(() => listRef.current?.scrollTo({ top: 999999 }), 0);
    }
  }

  if (!agent) {
    return (
      <div className="p-8 text-center text-gray-600">
        <p className="font-medium">Select an agent to preview</p>
        <p className="text-sm text-gray-500 mt-1">Pick an agent from the list to see its live preview here.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[560px] flex-col">
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500">Start the conversation with <span className="font-medium">{agent.name}</span>.</div>
        ) : (
          messages.map(m => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                m.role === "user"
                  ? "ml-auto bg-indigo-600 text-white"
                  : "mr-auto bg-gray-100 text-gray-900"
              }`}
            >
              {m.content}
            </div>
          ))
        )}
      </div>

      <form onSubmit={onSend} className="border-t p-3 flex gap-2">
        <input
          className="flex-1 h-10 rounded-lg border border-gray-200 px-3 outline-none focus:border-indigo-400"
          placeholder={`Message ${agent.name}…`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="h-10 rounded-lg bg-indigo-600 px-4 text-white font-medium disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </div>
  );
}