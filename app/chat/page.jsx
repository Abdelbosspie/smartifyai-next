"use client";
import { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const pushAssistant = (content) =>
    setMessages((prev) => [...prev, { role: "assistant", content }]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      // Handle non-OK HTTP responses with useful info
      if (!res.ok) {
        let payload = null;
        try { payload = await res.json(); } catch {}
        const errMsg =
          payload?.error ||
          (res.status === 429
            ? "OpenAI quota exceeded. Add billing or enable demo fallback."
            : `Chat failed (${res.status}).`);
        pushAssistant(errMsg);
        return;
      }

      const data = await res.json();
      if (data?.reply) {
        pushAssistant(data.reply);
      } else if (data?.error) {
        pushAssistant(data.error);
      } else {
        pushAssistant("…");
      }
    } catch (error) {
      console.error("Chat error:", error);
      pushAssistant("Network error. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-xl p-6">
        <h1 className="text-2xl font-semibold mb-4">SmartifyAI Chatbot</h1>

        <div className="h-96 overflow-y-auto border border-gray-200 rounded-md p-4 mb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}>
              <span
                className={`inline-block px-4 py-2 rounded-lg ${
                  msg.role === "user"
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                {msg.content}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}