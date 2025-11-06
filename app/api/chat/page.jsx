"use client";

import { useState, useRef, useEffect } from "react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom automatically
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: "default-agent", content: input }),
      });

      const data = await res.json();
      const reply = data?.reply || "No response from AI.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ There was an error connecting to the server." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />

        <main className="flex-1 flex flex-col p-6 bg-gray-50 overflow-hidden">
          <div className="flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-sm p-6">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.length === 0 && (
                <p className="text-gray-500 text-center mt-10">
                  👋 Start chatting with <span className="font-semibold text-indigo-600">SmartifyAI</span>.
                </p>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                      m.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="mt-4 flex items-center max-w-3xl mx-auto w-full">
            <textarea
              className="flex-1 resize-none border border-gray-300 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="ml-3 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}