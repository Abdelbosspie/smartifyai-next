import "../styles/globals.css";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: "SmartifyAI",
  description: "We integrate AI into your business in one week.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-[#04020a] via-[#0a0a1f] to-[#050312] text-white font-sans">
        {children}
        <Analytics /> {/* 👈 This line re-enables tracking */}
      </body>
    </html>
  );
}
