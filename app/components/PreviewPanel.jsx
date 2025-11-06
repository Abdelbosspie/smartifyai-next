"use client";

export default function PreviewPanel({ agent }) {
  if (!agent) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="text-gray-600">Select an agent to preview.</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Preview — {agent.name}</h3>
        <button
          onClick={() => alert("Deploy flow coming soon")}
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:border-indigo-400 hover:text-indigo-600"
        >
          Deploy
        </button>
      </div>

      {/* Chat-like mock */}
      <div className="rounded-lg border bg-gray-50 p-4 h-[460px] flex flex-col">
        <div className="text-xs text-gray-500 mb-2">ChatBot</div>
        <div className="space-y-3 overflow-auto">
          <div className="max-w-[75%] rounded-2xl bg-white border p-3 shadow-sm">
            Hi! How can I help you?
          </div>
          <div className="max-w-[75%] rounded-2xl ml-auto bg-indigo-600 text-white p-3 shadow-sm">
            Tell me about your pricing.
          </div>
          <div className="max-w-[75%] rounded-2xl bg-white border p-3 shadow-sm">
            We offer Free, Hobby, Standard, and Pro. Need help choosing?
          </div>
        </div>

        <div className="mt-auto flex gap-2 pt-3">
          <input
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Message…"
          />
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
            Send
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-400 mt-3 text-right">Powered by SmartifyAI</div>
    </div>
  );
}