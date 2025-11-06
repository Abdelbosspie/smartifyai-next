export default function ConversationsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Conversations</h1>
        <p className="text-sm text-gray-500">Search and review user chats & calls.</p>
      </header>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <input
            type="search"
            placeholder="Search by phone, email, or message…"
            className="h-10 w-full md:w-96 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-indigo-400"
          />
          <div className="flex gap-2">
            <select className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm">
              <option>All Channels</option>
              <option>Web Chat</option>
              <option>WhatsApp</option>
              <option>Voice</option>
            </select>
            <select className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm">
              <option>Any Agent</option>
              <option>Sales Bot</option>
              <option>Receptionist</option>
            </select>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-10 text-center text-gray-600">
          Conversation list coming soon (hook to DB once messages land).
        </div>
      </div>
    </div>
  );
}