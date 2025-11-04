import "../styles/globals.css";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: "SmartifyAI",
  description: "We integrate AI into your business in one week",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth" data-theme="light">
      {/* Switched to a light theme site-wide */}
      <body className="bg-white text-slate-900 font-sans antialiased">
        {children}
        <Analytics /> {/* Vercel visitor analytics */}

        {/* Chatbase Chatbot Embed (kept, works with the new light theme) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                if(!window.chatbase || window.chatbase("getState") !== "initialized"){
                  window.chatbase = (...arguments) => {
                    if(!window.chatbase.q){window.chatbase.q=[]}
                    window.chatbase.q.push(arguments)
                  };
                  window.chatbase = new Proxy(window.chatbase,{
                    get(target, prop){
                      if(prop === "q"){return target.q}
                      return (...args) => target(prop, ...args)
                    }
                  });
                }
                const onLoad = function(){
                  const script = document.createElement("script");
                  script.src = "https://www.chatbase.co/embed.min.js";
                  script.id = "xA3cZzzmrXqAnJOtN2Uwc"; // ✅ Your Chatbase bot ID
                  script.domain = "www.chatbase.co";
                  document.body.appendChild(script);
                };
                if(document.readyState === "complete"){onLoad()}
                else {window.addEventListener("load", onLoad)}
              })();

              // Help Chatbase remember session context (fixes 'Load recent conversations')
              window.addEventListener("load", () => {
                if (window.chatbase) {
                  window.chatbase('setUserId', Date.now().toString());
                }
              });
            `,
          }}
        />

        {/* Smoothly handle cross-page hash links (e.g., /pricing -> /#contact) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                if (location.hash) {
                  const el = document.querySelector(location.hash);
                  if (el) {
                    // Wait until layout paints, then smooth scroll
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
