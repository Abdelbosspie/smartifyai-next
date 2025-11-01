export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-inner">
          <h1>We integrate AI into your business in one week.</h1>
          <p className="lead">
            From customer support chatbots to automated reports and workflows — 
            we plug AI into the tools you already use and save you time and money.
          </p>

          <div className="hero-cta">
            <a href="#contact" className="btn btn-primary">Book a Free AI Audit</a>
            <a href="#services" className="btn btn-ghost">See what we build</a>
          </div>

          <div className="hero-badges" role="list" aria-label="Key benefits">
            <span className="chip" role="listitem">Prototype in 5 days</span>
            <span className="chip" role="listitem">Works with your stack</span>
            <span className="chip" role="listitem">No full-time devs needed</span>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section" id="services">
        <div className="container">
          <h2 className="section-title">What we do</h2>
          <p className="section-subtitle">Pick a starter solution or ask for something custom.</p>

          <div className="cards">
            <article className="card">
              <h3>AI Chatbots (Web & WhatsApp)</h3>
              <ul>
                <li>Custom ChatGPT-powered bot</li>
                <li>Knowledge base ingestion</li>
                <li>Handover to email/WhatsApp</li>
              </ul>
              <div className="price">Setup from £500</div>
            </article>

            <article className="card">
              <h3>Workflow Automation</h3>
              <ul>
                <li>Zapier/Make + Python glue</li>
                <li>Google Sheets & Gmail</li>
                <li>Shopify / Notion / Slack</li>
              </ul>
              <div className="price">Projects from £300</div>
            </article>

            <article className="card">
              <h3>AI Tools & Analytics</h3>
              <ul>
                <li>Streamlit/React frontends</li>
                <li>OpenAI / Hugging Face</li>
                <li>Secure, simple hosting</li>
              </ul>
              <div className="price">From £750</div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
