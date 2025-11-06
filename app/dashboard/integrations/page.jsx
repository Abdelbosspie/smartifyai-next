"use client";

import { useState } from "react";

function IntegrationCard({ title, desc, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{desc}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function IntegrationsPage() {
  const [connectedWA, setConnectedWA] = useState(false);
  const [connectedWeb, setConnectedWeb] = useState(true);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Integrations</h1>
        <p className="text-sm text-gray-500">Connect channels and drop-in widgets.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IntegrationCard
          title="Website Widget"
          desc="Embed the chat widget on your website."
        >
          <code className="block rounded bg-gray-50 p-3 text-xs overflow-x-auto">
{`<script src="https://www.chatbase.co/embed.min.js" id="YOUR_BOT_ID"></script>`}
          </code>
          <p className="mt-2 text-xs text-gray-500">
            Paste into your site’s <code>&lt;head&gt;</code> or before <code>&lt;/body&gt;</code>.
          </p>
          <div className="mt-3">
            <button
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm hover:border-gray-300"
              onClick={() => setConnectedWeb(true)}
            >
              {connectedWeb ? "Connected ✓" : "Mark as Connected"}
            </button>
          </div>
        </IntegrationCard>

        <IntegrationCard
          title="WhatsApp"
          desc="Connect your WhatsApp Business API number."
        >
          <div className="flex items-center gap-2">
            <button
              className="h-9 rounded-lg bg-indigo-600 px-3 text-sm font-medium text-white hover:bg-indigo-700"
              onClick={() => alert("Launch your WA onboarding flow here")}
            >
              Setup
            </button>
            <button
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm hover:border-gray-300"
              onClick={() => setConnectedWA((v) => !v)}
            >
              {connectedWA ? "Disconnect" : "Mark as Connected"}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            After verification, messages will sync to Conversations.
          </p>
        </IntegrationCard>
      </div>
    </div>
  );
}