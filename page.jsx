"use client";
import StatsCard from "./components/StatsCard";
import AgentCard from "./components/AgentCard";

export default function DashboardPage() {
  const stats = [
    { label: "AI Agents", value: 3 },
    { label: "Messages Used", value: 1245 },
    { label: "Plan", value: "Standard" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((s, i) => (
          <StatsCard key={i} {...s} />
        ))}
      </div>

      <h2 className="text-2xl font-semibold mb-4">Your Agents</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AgentCard name="Retail Assistant" messages="540" />
        <AgentCard name="PropertyBot" messages="320" />
        <AgentCard name="SupportBot" messages="385" />
      </div>
    </div>
  );
}