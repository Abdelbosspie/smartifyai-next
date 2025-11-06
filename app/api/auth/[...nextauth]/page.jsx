"use client";
import { useState } from "react";

export default function ChatPage({ params }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const agentId = params.id;

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId, message: input }),
    });

    const data = await res.json();
    if (data.reply) {
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Chat with your Agent</h2>
      <div className="flex-1 overflow-y-auto border rounded-lg p-4 bg-gray-50 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`p-2 rounded ${m.role === "user" ? "bg-blue-100" : "bg-gray-200"}`}>
            <b>{m.role === "user" ? "You" : "Bot"}:</b> {m.content}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          className="flex-1 border rounded p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="bg-purple-600 text-white px-4 py-2 rounded">
          Send
        </button>
      </div>
    </div>
  );
}