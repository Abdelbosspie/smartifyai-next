export default function Services() {
  return (
    <section className="grid md:grid-cols-3 gap-6 px-10 py-20">
      <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
        <h3 className="font-semibold mb-2">AI Chatbots</h3>
        <p className="text-gray-400">Answer FAQs, qualify leads, and route requests 24/7.</p>
      </div>
      <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
        <h3 className="font-semibold mb-2">Workflow Automation</h3>
        <p className="text-gray-400">Automate repetitive tasks: emails, reports, CRM updates, and lead routing.</p>
      </div>
      <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
        <h3 className="font-semibold mb-2">AI Analytics</h3>
        <p className="text-gray-400">Custom dashboards, OpenAI integrations, and reporting tools.</p>
      </div>
    </section>
  );
}
