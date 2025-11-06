export default function StatsCard({ label, value }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
      <p className="text-gray-500 text-sm">{label}</p>
      <h3 className="text-2xl font-semibold text-indigo-600 mt-2">{value}</h3>
    </div>
  );
}