import "../styles/globals.css";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: "SmartifyAI",
  description: "We integrate AI into your business in one week",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-[#04020a] via-[#0a0a1f] to-[#050312] text-white font-sans">
        {children}
        <Analytics /> {/* 👈 Enables Vercel visitor analytics */}

        {/* 👇 Chatbase Chatbot Embed */}
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
                  script.id = "dK__O4aVas5B9SAKXsukW"; // 👈 your Chatbase bot ID
                  script.domain = "www.chatbase.co";
                  document.body.appendChild(script);
                };
                if(document.readyState === "complete"){onLoad()}
                else {window.addEventListener("load", onLoad)}
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
