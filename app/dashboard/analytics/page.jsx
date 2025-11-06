function Card({ title, value, sub }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
      {sub ? <p className="mt-1 text-xs text-gray-400">{sub}</p> : null}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500">Key usage and performance metrics.</p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Conversations" value="1,284" sub="+6% vs last 7 days" />
        <Card title="Avg. Response" value="1.2s" sub="-0.3s faster" />
        <Card title="Leads Captured" value="94" sub="+12 this week" />
        <Card title="CSAT" value="4.7/5" sub="Last 100 ratings" />
      </section>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm font-medium text-gray-900">Conversations per Day</p>
        <div className="mt-4 flex items-end gap-2 h-40">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="w-6 rounded bg-indigo-500"
              style={{ height: `${30 + ((i * 13) % 70)}%` }}
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-500">Sample chart (replace with real data later).</p>
      </div>
    </div>
  );
}