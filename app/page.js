// app/page.js
export default function Home() {
  return (
    <main
      dangerouslySetInnerHTML={{
        __html: `
          <!-- your SmartifyAI HTML body only (no <html>/<head>/<body>/<script>) -->
          <section class="hero"><div class="container hero-inner">
            <h1>We integrate AI into your business in one week.</h1>
            <!-- ...rest of your sections... -->
          </div></section>
        `
      }}
    />
  );
}
