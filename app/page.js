"use client";
import React, { useState } from "react";

// --- Reusable Feature Card ---
function Feature({ icon, title, desc, href }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="text-4xl mb-4 text-indigo-600">{icon}</div>
      <h4 className="text-2xl font-semibold mb-2 text-slate-900">{title}</h4>
      <p className="text-slate-600 mb-6">{desc}</p>
      <a
        href={href || "#contact"}
        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-all duration-300 group-hover:underline"
      >
        Learn More <span className="text-lg">→</span>
      </a>
    </div>
  );
}

// --- Testimonial Card ---
function Testimonial({ quote, author }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
      <p className="text-slate-700 italic mb-6">"{quote}"</p>
      <p className="text-indigo-600 font-semibold">- {author}</p>
    </div>
  );
}

// --- Homepage ---
export default function Home() {
  // Helper for smooth scroll
  const smoothScroll = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const testimonials = [
    {
      quote:
        "SmartifyAI transformed our customer support with AI-powered chatbots that truly understand our clients.",
      author: "Emily R., CEO of TechSolutions",
    },
    {
      quote:
        "The voice agents are incredible – they handle calls flawlessly and have boosted our efficiency immensely.",
      author: "Mark T., Operations Manager at RetailCo",
    },
    {
      quote:
        "Integration was seamless, and the analytics give us insights we've never had before.",
      author: "Sophia L., Marketing Lead at Marketify",
    },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans scroll-smooth">
      {/* --- Navbar --- */}
      <nav className="flex justify-between items-center px-8 py-6 border-b border-slate-200 sticky top-0 z-50 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <button
          onClick={() => smoothScroll("body")}
          className="text-2xl font-bold tracking-tight text-slate-900 hover:text-indigo-600 transition-colors"
        >
          Smartify<span className="text-indigo-600">AI</span>
        </button>
        <ul className="hidden md:flex gap-8 text-slate-600 text-base font-medium">
          <li>
            <button
              onClick={() => smoothScroll("#features")}
              className="hover:text-slate-900 transition-all duration-300"
            >
              Features
            </button>
          </li>
          <li>
            <button
              onClick={() => smoothScroll("#how-it-works")}
              className="hover:text-slate-900 transition-all duration-300"
            >
              How It Works
            </button>
          </li>
          <li>
            <a href="/pricing" className="hover:text-slate-900 transition-all duration-300">
              Pricing
            </a>
          </li>
          <li>
            <button
              onClick={() => smoothScroll("#faq")}
              className="hover:text-slate-900 transition-all duration-300"
            >
              FAQ
            </button>
          </li>
          <li>
            <button
              onClick={() => smoothScroll("#contact")}
              className="hover:text-slate-900 transition-all duration-300"
            >
              Contact
            </button>
          </li>
        </ul>
        <a
          href="/register"
          className="ml-8 bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-lg font-semibold text-white shadow-sm transition-all duration-300 hidden md:inline-block"
        >
          Try for Free
        </a>
      </nav>

      {/* --- Hero Section --- */}
      <section className="flex flex-col items-center justify-center text-center py-24 px-6">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight max-w-5xl">
          <span>Supercharge your business with </span>
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Artificial Intelligence
          </span>
        </h1>
        <p className="text-slate-600 max-w-2xl mb-10 leading-relaxed text-lg md:text-xl">
          Empower your business with next-gen AI chatbots and voice agents. Automate, scale, and delight your customers—no code required.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <a
            href="/register"
            className="bg-indigo-600 hover:bg-indigo-700 px-8 py-4 rounded-xl font-semibold text-white transition-all shadow-sm"
          >
            Try for Free
          </a>
          <button
            onClick={() => smoothScroll("#features")}
            className="border border-slate-300 hover:border-slate-400 px-8 py-4 rounded-xl font-semibold text-slate-700 hover:text-slate-900 transition-all"
          >
            See Features
          </button>
        </div>
      </section>

      {/* --- Features Overview Section --- */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center">What SmartifyAI Offers</h2>
        <div className="grid md:grid-cols-4 gap-10">
          <Feature icon="🛠️" title="Build" desc="Easily create AI chatbots and voice agents tailored to your business needs." />
          <Feature icon="🧪" title="Test" desc="Simulate conversations and calls to ensure your AI agents perform flawlessly." />
          <Feature icon="🚀" title="Deploy" desc="Launch your AI agents across multiple platforms with just a few clicks." />
          <Feature icon="📊" title="Monitor" desc="Track performance and gather insights with real-time analytics dashboards." />
        </div>
      </section>

      {/* --- How It Works Section --- */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-200">
        <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-12 text-center">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-md transition-all">
            <div className="mb-6 text-6xl text-indigo-600 font-bold">1</div>
            <h3 className="text-xl font-semibold mb-3">Connect Data</h3>
            <p className="text-slate-600 max-w-xs mx-auto">
              Integrate your CRM, databases, and communication platforms effortlessly.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-md transition-all">
            <div className="mb-6 text-6xl text-indigo-600 font-bold">2</div>
            <h3 className="text-xl font-semibold mb-3">Train Model</h3>
            <p className="text-slate-600 max-w-xs mx-auto">
              Customize and train your AI agents to understand your unique workflows.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-md transition-all">
            <div className="mb-6 text-6xl text-indigo-600 font-bold">3</div>
            <h3 className="text-xl font-semibold mb-3">Deploy Voice/Chat Agent</h3>
            <p className="text-slate-600 max-w-xs mx-auto">
              Launch AI agents on web, phone, WhatsApp, and other channels instantly.
            </p>
          </div>
        </div>
      </section>

      {/* --- Customer Testimonials Section --- */}
      <section id="testimonials" className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center">What Our Customers Say</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {testimonials.map((t, i) => (
            <Testimonial key={i} quote={t.quote} author={t.author} />
          ))}
        </div>
      </section>

      {/* --- FAQ Section (Two-Column Layout) --- */}
      <section id="faq" className="max-w-6xl mx-auto px-6 py-24 border-t border-slate-200 grid md:grid-cols-2 gap-16 items-start">
        {/* Left Side: Title & Description */}
        <div className="space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">Questions & Answers <br /> About AI Voice Agents</h2>
          <p className="text-slate-600 max-w-md text-lg">
            Explore how SmartifyAI’s chat and voice agents integrate seamlessly into your business. Our platform helps automate, connect, and scale your communication effortlessly.
          </p>
        </div>

        {/* Right Side: FAQ Accordion */}
        <div className="space-y-4">
          {[
            { q: "How do I create an AI Voice or Chat Agent with SmartifyAI?", a: "You can easily build one through your dashboard — connect your data sources, define goals, and deploy instantly with no code." },
            { q: "What is the pricing for SmartifyAI?", a: "Pricing depends on your usage and features — view our pricing plans for chatbots, voice agents, or enterprise packages." },
            { q: "Can I connect SmartifyAI to my existing phone number?", a: "Yes. SmartifyAI integrates with Twilio, WhatsApp, and other communication providers so you can use your existing number." },
            { q: "What tools does my company need to use SmartifyAI?", a: "All you need is a browser and an internet connection — we handle hosting, deployment, and scaling for you." },
            { q: "Can SmartifyAI handle multiple conversations or calls at once?", a: "Yes, our system scales automatically to handle thousands of simultaneous users or calls." },
            { q: "Does SmartifyAI support voicemail detection?", a: "Absolutely — AI voice agents can detect voicemail and handle callbacks or record responses automatically." },
            { q: "Can SmartifyAI agents make outbound calls?", a: "Yes, you can schedule or trigger outbound calls to clients and leads via your CRM or through automated workflows." },
            { q: "Why is SmartifyAI ideal for customer engagement?", a: "Because it blends voice, chat, and workflow automation under one platform — reliable, fast, and secure." },
            { q: "Which AI model powers SmartifyAI agents?", a: "SmartifyAI agents use cutting-edge LLM technology optimized for business communication and automation." },
          ].map((item, index) => (
            <details
              key={index}
              className="bg-white border border-slate-200 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-sm"
            >
              <summary className="flex justify-between items-center text-lg font-medium text-slate-900">
                {item.q}
                <span className="text-indigo-600 text-xl font-bold">+</span>
              </summary>
              <p className="mt-3 text-slate-700">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* --- Pricing CTA Section --- */}
      <section className="py-24 px-6 bg-slate-50 border-t border-slate-200 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-5">Ready to choose your plan?</h2>
        <p className="text-slate-600 max-w-xl mx-auto mb-9 text-lg">
          Explore our flexible pricing plans designed to fit businesses of all sizes.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/pricing"
            className="bg-indigo-600 hover:bg-indigo-700 px-8 py-4 rounded-xl font-semibold text-white shadow-sm transition-all"
          >
            View Pricing Plans
          </a>
        </div>
      </section>

      {/* --- Contact Us --- */}
      <section id="contact" className="text-center py-28 border-t border-slate-200">
        <h3 className="text-3xl md:text-4xl font-semibold mb-6">Need Help Getting Started?</h3>
        <p className="text-slate-600 mb-10 max-w-xl mx-auto text-lg">
          Building your first AI Chatbot or AI Receptionist? We’ve got you covered. Fill out the form below to get platform access, onboarding guidance, or technical support from our team.
        </p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();

            const formData = {
              name: e.target[0].value,
              email: e.target[1].value,
              topic: e.target[2].value,
              message: e.target[3].value,
            };

            try {
              const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
              });

              const data = await res.json();
              if (data.success) {
                alert("✅ Your message has been sent! We'll get back to you shortly.");
                e.target.reset();
              } else {
                alert("❌ Something went wrong. Please try again later.");
              }
            } catch (err) {
              console.error("Form submission error:", err);
              alert("⚠️ Network error. Please try again later.");
            }
          }}
          className="grid grid-cols-1 gap-6 px-6 max-w-2xl mx-auto text-left"
        >
          <input
            type="text"
            placeholder="Full Name"
            className="px-4 py-3 rounded-lg bg-white border border-slate-300 text-slate-900 w-full"
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            className="px-4 py-3 rounded-lg bg-white border border-slate-300 text-slate-900 w-full"
            required
          />
          <select className="px-4 py-3 rounded-lg bg-white border border-slate-300 text-slate-900 w-full">
            <option value="">Select a Topic</option>
            <option value="setup">Getting Started / Setup Help</option>
            <option value="support">Technical Support</option>
            <option value="feedback">Product Feedback</option>
            <option value="billing">Billing & Subscription</option>
          </select>
          <textarea
            rows="5"
            placeholder="Tell us how we can help you..."
            className="px-4 py-3 rounded-lg bg-white border border-slate-300 text-slate-900 w-full"
            required
          ></textarea>

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3 rounded-lg font-medium text-white transition-all"
          >
            Send Message
          </button>
        </form>

        <p className="text-slate-500 mt-8 text-sm">
          Prefer direct contact? Email us at {" "}
          <a href="mailto:support@smartifyai.com" className="underline text-indigo-600 hover:text-indigo-700">
            support@smartifyai.com
          </a>
        </p>
      </section>

      {/* --- Footer --- */}
      <footer className="text-center text-slate-500 py-6 border-t border-slate-200 text-sm">
        © {new Date().getFullYear()} SmartifyAI. All rights reserved.
      </footer>
    </main>
  );
}