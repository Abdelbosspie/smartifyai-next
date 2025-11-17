import "../styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
import Providers from "./providers";
import SmartifyAIWidget from "./SmartifyAIWidget";

export const metadata = {
  title: "SmartifyAI",
  description: "We integrate AI into your business in one week",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth" data-theme="light">
      <body className="bg-white text-slate-900 font-sans antialiased">
        <Providers>
          {children}
          <Analytics /> {/* Vercel visitor analytics */}
        </Providers>
        <SmartifyAIWidget />
      

        {/* Smooth scroll handler */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                if (location.hash) {
                  const el = document.querySelector(location.hash);
                  if (el) {
                    setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
                  }
                }
              })();
            `,
          }}
        />

        
      </body>
    </html>
  );
}