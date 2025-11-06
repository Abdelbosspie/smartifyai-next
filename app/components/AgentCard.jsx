"use client";

export default function AgentCard({ agent, active, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`text-left w-full rounded-xl border transition-all p-4 bg-white
        ${active ? "border-indigo-400 shadow-md" : "border-gray-200 hover:border-indigo-300 hover:shadow-sm"}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-lg font-semibold">{agent?.name || "Untitled Agent"}</div>
        {agent?.voice && (
          <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700">
            {agent.voice}
          </span>
        )}
      </div>

      <div className="text-sm text-gray-600">
        {agent?.type || "Chatbot"} • {agent?.messages ?? 0} msgs
      </div>

      {agent?.updatedAt && (
        <div className="text-xs text-gray-500 mt-2">
          Updated {new Date(agent.updatedAt).toLocaleString()}
        </div>
      )}
    </button>
  );
}