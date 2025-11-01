import Button from "../components/Button";

export default function Hero() {
  return (
    <section className="text-center py-20 px-6">
      <h1 className="text-5xl md:text-6xl font-bold mb-6">
        We integrate <span className="text-indigo-400">AI</span> into your business in one week.
      </h1>
      <p className="text-gray-400 max-w-2xl mx-auto mb-10">
        From customer support chatbots to automated reports and workflows — we plug AI into your existing tools.
      </p>

      <div className="flex justify-center gap-4">
        <Button text="Book a Free AI Audit" href="#" primary />
        <Button text="See what we build" href="#" />
      </div>
    </section>
  );
}
