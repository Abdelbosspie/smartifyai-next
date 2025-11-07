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
          {activeTab === "knowledge" && <KnowledgeBase />}
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

// --- Placeholder Tabs ---
function KnowledgeBase() {
  return (
    <div className="text-sm text-gray-500">
      Upload or add documents to train your agent. (Coming soon)
    </div>
  );
}

function Functions() {
  return (
    <div className="text-sm text-gray-500">
      Define your agent’s actions and integrations. (Coming soon)
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