// app/layout.js
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";

export const metadata = {
  title: "SmartifyAI — We integrate AI into your business in one week",
  description:
    "SmartifyAI integrates AI into your business in one week. Chatbots, automations, and AI-driven analytics."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        {children}

        {/* Your site JS (loads after hydration) */}
        <Script src="/script.js" strategy="afterInteractive" />

        {/* Vercel tracking */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
