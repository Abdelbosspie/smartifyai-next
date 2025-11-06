"use client";
import { useState, useEffect } from "react";

export default function AgentBuilder({ params }) {
  const { id } = params;
  const [agent, setAgent] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [testInput, setTestInput] = useState("");
  const [response, setResponse] = useState("");

  useEffect(() => {
    fetch(`/api/agents/${id}`)
      .then((res) => res.json())
      .then((data) => setAgent(data));
  }, [id]);

  const handleSavePrompt = async () => {
    await fetch(`/api/agents/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    alert("Prompt saved!");
  };

  const handleTestChat = async () => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId: id, message: testInput }),
    });
    const data = await res.json();
    setResponse(data.reply);
  };

  if (!agent) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex flex-row h-screen">
      {/* LEFT: Prompt Editor */}
      <div className="flex-1 p-6 border-r overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4">{agent.name} – Prompt Editor</h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type in the system prompt or role for your chatbot..."
          className="w-full h-[60vh] border rounded p-3 font-mono text-sm"
        />
        <button
          onClick={handleSavePrompt}
          className="mt-4 bg-purple-600 text-white px-4 py-2 rounded"
        >
          Save Prompt
        </button>
      </div>

      {/* RIGHT: Settings + Test Chat */}
      <div className="w-[400px] p-6 flex flex-col border-l">
        <h3 className="text-lg font-semibold mb-2">Test Chat</h3>
        <div className="flex-1 border rounded p-3 overflow-y-auto mb-3 bg-gray-50">
          {response && <p className="text-gray-800">{response}</p>}
        </div>
        <input
          className="border rounded p-2 mb-2"
          placeholder="Type a message..."
          value={testInput}
          onChange={(e) => setTestInput(e.target.value)}
        />
        <button onClick={handleTestChat} className="bg-purple-600 text-white px-4 py-2 rounded">
          Send
        </button>
      </div>
    </div>
  );
}