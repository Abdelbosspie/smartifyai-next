"use client";
import React from "react";

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/mo",
      desc: "Get started with basic AI capabilities and integrations.",
      features: [
        "1 AI agent",
        "100 messages/month",
        "API access",
        "Basic integrations",
        "Community support",
      ],
      highlight: false,
    },
    {
      name: "Hobby",
      price: "$40",
      period: "/mo",
      desc: "Ideal for hobby projects with more messages and AI actions.",
      features: [
        "1 AI agent",
        "2,000 messages/month",
        "5 AI actions",
        "Basic analytics",
        "Email support",
      ],
      highlight: false,
    },
    {
      name: "Standard",
      price: "$150",
      period: "/mo",
      desc: "Popular choice for small teams with multiple agents and seats.",
      features: [
        "2 AI agents",
        "12,000 messages/month",
        "10 AI actions",
        "3 seats",
        "Standard analytics",
      ],
      highlight: true,
    },
    {
      name: "Pro",
      price: "$500",
      period: "/mo",
      desc: "Advanced features and seats for growing businesses.",
      features: [
        "3 AI agents",
        "40,000 messages/month",
        "Advanced analytics",
        "5+ seats",
        "Priority email support",
      ],
      highlight: false,
    },
    {
      name: "Enterprise",
      price: "Let’s Talk",
      period: "",
      desc: "Custom plans with higher limits, dedicated support, and SLAs.",
      features: [
        "Unlimited AI agents",
        "Custom message limits",
        "Dedicated SLA & support",
        "Custom integrations",
        "White-label options",
      ],
      highlight: false,
    },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans scroll-smooth">
      {/* --- Navbar (sticky, consistent with home) --- */}
      <nav className="relative flex items-center px-6 md:px-8 py-5 border-b border-gray-200 backdrop-blur-md sticky top-0 z-50 bg-white/90">
        {/* Left: Logo */}
        <a
          href="/"
          className="text-2xl font-bold tracking-tight text-slate-900 hover:text-indigo-600 transition-colors"
        >
          Smartify<span className="text-indigo-600">AI</span>
        </a>

        {/* Center: Links */}
        <ul className="hidden md:flex gap-8 text-gray-600 absolute left-1/2 -translate-x-1/2">
          <li>
            <a href="/#services" className="hover:text-slate-900 transition-all duration-300">
              Features
            </a>
          </li>
          <li>
            <a href="/#whyus" className="hover:text-slate-900 transition-all duration-300">
              How It Works
            </a>
          </li>
          <li>
            <a href="/pricing" className="hover:text-slate-900 transition-all duration-300">
              Pricing
            </a>
          </li>
          <li>
            <a href="/#faq" className="hover:text-slate-900 transition-all duration-300">
              FAQ
            </a>
          </li>
          <li>
            <a href="/#contact" className="hover:text-slate-900 transition-all duration-300">
              Contact
            </a>
          </li>
        </ul>

        {/* Right: CTA */}
        <a
          href="/#contact"
          className="ml-auto hidden md:inline-flex bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Try for Free
        </a>
      </nav>

      {/* --- Header --- */}
      <section className="text-center py-28 px-6 border-b border-gray-200">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-slate-900">
          Flexible Plans <span className="text-indigo-600">Built for Every Business</span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Start free, scale when ready — pay only for what you use. Choose a plan that fits your growth.
        </p>
      </section>

      {/* --- Pricing Plans --- */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`w-full h-full flex flex-col p-8 rounded-2xl border transition-all duration-300 min-h-[560px] ${
                plan.highlight
                  ? "bg-indigo-50 border-indigo-300 shadow-sm hover:shadow-md hover:-translate-y-1"
                  : "bg-white border-gray-200 hover:border-indigo-400 hover:shadow-md hover:-translate-y-1"
              }`}
            >
              {/* Header: fixed height so all CTAs align */}
              <div className="h-[220px] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-slate-900">{plan.name}</h3>
                  {plan.name === "Standard" && (
                    <span className="ml-2 bg-indigo-100 text-indigo-700 rounded-full text-[10px] leading-none px-3 py-1">
                      Popular
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-slate-900 text-4xl font-bold leading-none tracking-tight">{plan.price}</div>
                  <div className="text-sm text-gray-500 mt-2">per month</div>
                </div>

                <a
                  href={plan.name === "Enterprise" ? "/#contact" : "/register"}
                  className={`w-full py-2.5 mt-4 text-sm font-medium rounded-lg transition-all duration-300 text-center ${
                    plan.highlight
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                      : "border border-gray-400 text-slate-700 hover:border-indigo-500 hover:text-indigo-700"
                  }`}
                >
                  {plan.name === "Enterprise" ? "Contact Us" : plan.name === "Free" ? "Get Started" : "Subscribe"}
                </a>
              </div>

              {/* Divider */}
              <hr className="my-6 border-gray-200" />

              {/* Feature list fills remaining space */}
              <ul className="space-y-3 text-slate-700">
                {plan.features.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-600">✔</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* --- FAQ CTA --- */}
      <section className="text-center py-16 border-t border-gray-200">
        <h3 className="text-2xl font-semibold text-slate-900 mb-3">
          Not sure which plan fits your business?
        </h3>
        <a
          href="/#faq"
          className="text-indigo-700 hover:text-indigo-600 font-medium transition-all underline"
        >
          Visit our FAQ
        </a>
      </section>

      {/* --- Footer --- */}
      <footer className="text-center text-gray-500 py-6 border-t border-gray-200 text-sm bg-white transition-all duration-500">
        © {new Date().getFullYear()} SmartifyAI. All rights reserved.
      </footer>
    </main>
  );
}