"use client";
import React, { useState } from "react";

export default function Home() {
  const [openFAQ, setOpenFAQ] = useState(null);

  // Smooth scroll helper
  const smoothScroll = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const faqs = [
    {
      q: "How long does it take to implement AI in my business?",
      a: "Most SmartifyAI projects are completed within 5 to 7 working days. We start with a discovery session, build your prototype, and deploy the solution by the end of the week"
    },
    {
      q: "Do I need any technical background?",
      a: "Not at all. We handle everything — from data setup and integration to automation workflows. You just describe your pain points, and we turn them into working AI tools."
    },
    {
      q: "What tools can SmartifyAI connect with?",
      a: "We integrate with Google Workspace, Notion, Slack, WhatsApp, HubSpot, Shopify, Trello, and hundreds of others using APIs and automation platforms like Zapier or Make."
    },
    {
      q: "How much does it cost?",
      a: "We offer project-based pricing starting at £300, depending on the scope. For recurring updates or advanced integrations, we offer optional monthly support plans."
    },
    {
      q: "Is my data secure?",
      a: "Absolutely. Your data stays private and never leaves your control. We use encrypted storage, secured APIs, and only connect to verified third-party services."
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#03020a] via-[#070a18] to-[#01020a] text-gray-100 font-sans scroll-smooth">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-6 border-b border-white/10 backdrop-blur-md sticky top-0 z-50 bg-black/40">
        <button
          onClick={() => smoothScroll("body")}
          className="text-2xl font-bold text-white tracking-tight hover:text-indigo-400 transition-colors"
        >
          Smartify<span className="text-indigo-400">AI</span>
        </button>
        <ul className="hidden md:flex gap-8 text-gray-300">
          <li><button onClick={() => smoothScroll("#mission")} className="hover:text-white transition-all duration-300">Our Mission</button></li>
          <li><button onClick={() => smoothScroll("#services")} className="hover:text-white transition-all duration-300">Services</button></li>
          <li><button onClick={() => smoothScroll("#examples")} className="hover:text-white transition-all duration-300">Examples</button></li>
          <li><button onClick={() => smoothScroll("#whyus")} className="hover:text-white transition-all duration-300">Why Us</button></li>
          <li><button onClick={() => smoothScroll("#faq")} className="hover:text-white transition-all duration-300">FAQ</button></li>
          <li><button onClick={() => smoothScroll("#contact")} className="hover:text-white transition-all duration-300">Contact</button></li>
        </ul>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(40,50,140,0.15)_0%,_transparent_60%)]"></div>
        <h2 className="text-4xl md:text-6xl font-bold mb-6 z-10 leading-tight">
          Supercharge your business with{" "}
          <span className="text-indigo-400">Artificial Intelligence</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mb-10 leading-relaxed z-10 text-lg">
          SmartifyAI helps small and medium businesses automate workflows,
          enhance customer experience, and make smarter data-driven decisions —
          all within one week
        </p>
        <div className="flex gap-4 flex-wrap justify-center z-10">
          <button
            onClick={() => smoothScroll("#contact")}
            className="bg-indigo-500 hover:bg-indigo-600 px-7 py-3 rounded-lg font-medium transition-all shadow-lg shadow-indigo-900/40 duration-300"
          >
            Contact Us
          </button>
          <button
            onClick={() => smoothScroll("#services")}
            className="border border-gray-600 hover:border-white px-7 py-3 rounded-lg font-medium text-gray-300 hover:text-white transition-all duration-300"
          >
            Explore Services
          </button>
        </div>
      </section>

      {/* Our Mission */}
      <section
        id="mission"
        className="max-w-6xl mx-auto px-6 py-24 border-t border-white/10 bg-gradient-to-b from-[#06061a] to-[#0b0b20] rounded-2xl shadow-lg shadow-indigo-900/20 transition-all duration-500"
      >
        <h3 className="text-3xl md:text-4xl font-semibold mb-6 text-center text-white">
          Our Mission
        </h3>
        <p className="text-gray-400 text-center mb-12 max-w-3xl mx-auto text-lg">
          Our mission is simple — make AI practical, fast, and impactful for every business.
          We believe in automation that frees up people, not replaces them.  
          SmartifyAI is built on three principles: innovation, simplicity, and results.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mt-10 text-center">
          <MissionCard
            icon="🚀"
            title="Innovation for All"
            desc="We bring enterprise-grade AI to small businesses with zero technical friction."
          />
          <MissionCard
            icon="🤝"
            title="Human + AI Collaboration"
            desc="Every workflow we automate starts with people — AI just helps them work smarter."
          />
          <MissionCard
            icon="🌍"
            title="Global Vision"
            desc="Our goal is to make AI solutions accessible to teams everywhere — affordable, fast, and transparent."
          />
        </div>
      </section>

      {/* Services */}
      <section id="services" className="max-w-6xl mx-auto px-6 py-24 transition-all duration-500">
        <h3 className="text-3xl md:text-4xl font-semibold mb-6 text-center text-white">
          Services
        </h3>
        <p className="text-gray-400 text-center mb-14 max-w-2xl mx-auto">
          Explore our core offerings that help businesses like yours save time, reduce costs, and grow smarter.
        </p>
        <div className="grid md:grid-cols-3 gap-10">
          <ServiceCard
            title="AI Chatbots"
            desc="Chatbots that handle customer queries, lead generation, and support — powered by ChatGPT and your company data."
            points={["Website & WhatsApp integration", "Custom training on FAQs", "24/7 intelligent support"]}
            price="Setup from £500"
          />
          <ServiceCard
            title="Workflow Automation"
            desc="Automate repetitive workflows — from reporting to CRM updates — using AI and tools you already use."
            points={["Google Sheets & Gmail", "Zapier/Make automation", "CRM & ERP integrations"]}
            price="Projects from £300"
          />
          <ServiceCard
            title="AI Dashboards & Tools"
            desc="Create mini internal tools — dashboards, content generators, and analytics apps built with AI APIs."
            points={["Custom React/Streamlit apps", "OpenAI & Hugging Face", "Secure hosting included"]}
            price="From £750"
          />
        </div>
      </section>

      {/* Examples */}
      <section id="examples" className="max-w-6xl mx-auto px-6 py-24 border-t border-white/10 transition-all duration-500">
        <h3 className="text-3xl md:text-4xl font-semibold mb-10 text-center text-white">
          Examples of Our Work
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <ExampleCard
            title="Retail Chatbot"
            desc="Built a multilingual chatbot for an e-commerce brand handling 300+ customer queries daily."
          />
          <ExampleCard
            title="Sales Automation"
            desc="Automated CRM updates for a real estate agency, saving 10 hours per week per agent."
          />
          <ExampleCard
            title="Analytics Dashboard"
            desc="Developed an AI-powered KPI dashboard for a consulting firm integrating live data from Google Sheets."
          />
        </div>
      </section>

      {/* Why Us */}
      <section id="whyus" className="max-w-6xl mx-auto px-6 py-24 border-t border-white/10 text-center transition-all duration-500">
        <h3 className="text-3xl md:text-4xl font-semibold mb-6 text-white">Why Choose SmartifyAI?</h3>
        <p className="text-gray-400 max-w-3xl mx-auto mb-14">
          We blend business strategy with technical expertise to deliver measurable outcomes — not just software.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <WhyCard icon="⚡" title="Fast Execution" desc="We deliver working AI prototypes within 5–7 days — not months." />
          <WhyCard icon="🧠" title="Deep Expertise" desc="Our team combines AI, business automation, and UX design expertise." />
          <WhyCard icon="💬" title="Client-Focused" desc="Every project starts with your needs and ends with your success metrics." />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-5xl mx-auto px-6 py-24 border-t border-white/10 transition-all duration-500">
        <h3 className="text-3xl md:text-4xl font-semibold text-center mb-10 text-white">
          Frequently Asked Questions
        </h3>
        <div className="space-y-4">
          {faqs.map((item, i) => (
            <div
              key={i}
              className="bg-[#0e1022]/80 p-6 rounded-xl border border-[#1e2338] hover:bg-[#15172a]/90 transition-all duration-300 cursor-pointer"
              onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
            >
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium text-white">{item.q}</h4>
                <span className="text-indigo-400 text-2xl">{openFAQ === i ? "−" : "+"}</span>
              </div>
              {openFAQ === i && <p className="mt-3 text-gray-400 text-sm leading-relaxed">{item.a}</p>}
            </div>
          ))}
        </div>
      </section>

   {/* Contact Us */}
      <section id="contact" className="text-center py-28 bg-gradient-to-b from-[#040312] to-[#08091a] border-t border-white/10">
        <h3 className="text-3xl md:text-4xl font-semibold mb-6 text-white">Contact Us</h3>
        <p className="text-gray-400 mb-10 max-w-xl mx-auto">
          Ready to integrate AI into your business? Fill in your details and we’ll send a personalized proposal within 24 hours.
        </p>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 max-w-3xl mx-auto text-left">
          <input
            type="text"
            placeholder="Full Name"
            className="px-4 py-3 rounded-lg bg-[#141826] border border-white/20 text-white w-full"
          />
          <input
            type="email"
            placeholder="Business Email"
            className="px-4 py-3 rounded-lg bg-[#141826] border border-white/20 text-white w-full"
          />
          <input
            type="text"
            placeholder="Company Name"
            className="px-4 py-3 rounded-lg bg-[#141826] border border-white/20 text-white w-full"
          />
          <input
            type="text"
            placeholder="Industry (e.g., Retail, Finance, Healthcare)"
            className="px-4 py-3 rounded-lg bg-[#141826] border border-white/20 text-white w-full"
          />
          <select
            className="px-4 py-3 rounded-lg bg-[#141826] border border-white/20 text-white w-full"
          >
            <option value="">Project Type</option>
            <option value="chatbot">AI Chatbot</option>
            <option value="automation">Workflow Automation</option>
            <option value="dashboard">AI Analytics / Dashboard</option>
            <option value="custom">Custom AI Project</option>
          </select>
          <select
            className="px-4 py-3 rounded-lg bg-[#141826] border border-white/20 text-white w-full"
          >
            <option value="">Estimated Budget</option>
            <option value="300">Under £300</option>
            <option value="500">£300–£500</option>
            <option value="1000">£500–£1,000</option>
            <option value="custom">Custom Quote</option>
          </select>
          <textarea
            rows="5"
            placeholder="Tell us about your project, challenges, or goals..."
            className="col-span-1 md:col-span-2 px-4 py-3 rounded-lg bg-[#141826] border border-white/20 text-white w-full"
          ></textarea>

          <button className="col-span-1 md:col-span-2 bg-indigo-500 hover:bg-indigo-600 px-8 py-3 rounded-lg font-medium transition-all">
            Submit Inquiry
          </button>
        </form>

        <p className="text-gray-500 mt-8 text-sm">
          Prefer direct contact? Email us at{" "}
          <a href="mailto:contact.smartifyai@gmail.com" className="underline text-indigo-400">
            contact.simplifyai@gmail.com
          </a>
        </p>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-500 py-6 border-t border-white/10 text-sm bg-black/20 transition-all duration-500">
        © 2025 SmartifyAI. All rights reserved.
      </footer>
    </main>
  );
}

/* ----- Small Components ----- */
function MissionCard({ icon, title, desc }) {
  return (
    <div className="p-6 bg-[#0f1023]/80 border border-[#1f2240] rounded-xl hover:-translate-y-2 transition-all duration-300">
      <div className="text-4xl mb-3 text-indigo-400">{icon}</div>
      <h4 className="text-xl font-semibold mb-2 text-white">{title}</h4>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  );
}

function ServiceCard({ title, desc, points, price }) {
  return (
    <div className="bg-[#0e1022]/80 p-8 rounded-xl border border-[#1e2338] hover:bg-[#161a2a]/90 hover:-translate-y-2 transition-all duration-300 shadow-lg shadow-indigo-900/20">
      <h4 className="text-2xl font-semibold mb-4 text-white">{title}</h4>
      <p className="text-gray-400 mb-4 text-sm">{desc}</p>
      <ul className="text-sm text-gray-500 list-disc pl-5 space-y-1 mb-4">
        {points.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
      <p className="text-indigo-400 font-medium text-sm">{price}</p>
    </div>
  );
}

function ExampleCard({ title, desc }) {
  return (
    <div className="bg-[#0f1023]/80 p-6 rounded-xl border border-[#1f2240] hover:bg-[#161a2a]/90 transition-all duration-300 text-left">
      <h4 className="text-xl font-semibold text-white mb-2">{title}</h4>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  );
}

function WhyCard({ icon, title, desc }) {
  return (
    <div className="p-6 bg-[#0f1023]/80 border border-[#1f2240] rounded-xl hover:-translate-y-2 transition-all duration-300">
      <div className="text-4xl mb-3 text-indigo-400">{icon}</div>
      <h4 className="text-xl font-semibold mb-2 text-white">{title}</h4>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  );
}
