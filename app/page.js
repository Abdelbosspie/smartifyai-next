// app/page.js
export default function Home() {
  return (
    <main>
      <header className="navbar">
        <div className="logo">SmartifyAI</div>
        <nav>
          <a href="#services">Services</a>
          <a href="#examples">Examples</a>
          <a href="#why">Why Us</a>
          <a href="#audit" className="cta">Free AI Audit</a>
        </nav>
      </header>

      <section className="hero">
        <h1>We integrate AI into your business in one week.</h1>
        <p>
          From customer support chatbots to automated reports and workflows — we plug AI into
          the tools you already use and save you time and money.
        </p>
        <div className="cta-buttons">
          <a href="#audit" className="btn primary">Book a Free AI Audit</a>
          <a href="#services" className="btn secondary">See what we build</a>
        </div>
        <div className="badges">
          <span>Prototype in 5 days</span>
          <span>Works with your stack</span>
          <span>No full-time devs needed</span>
        </div>
      </section>

      <section className="services" id="services">
        <h2>What we do</h2>
        <p>Pick a starter solution or ask for something custom.</p>

        <div className="service-grid">
          <div className="card">
            <h3>AI Chatbots (Web & WhatsApp)</h3>
            <ul>
              <li>Custom ChatGPT-powered bot</li>
              <li>Knowledge base ingestion</li>
              <li>Handover to email/WhatsApp</li>
            </ul>
            <p className="price">Setup from £500</p>
          </div>

          <div className="card">
            <h3>Workflow Automation</h3>
            <ul>
              <li>Zapier/Make + Python glue</li>
              <li>Google Sheets & Gmail</li>
              <li>Shopify / Notion / Slack</li>
            </ul>
            <p className="price">Projects from £300</p>
          </div>

          <div className="card">
            <h3>AI Tools & Analytics</h3>
            <ul>
              <li>Streamlit/React frontends</li>
              <li>OpenAI / Hugging Face</li>
              <li>Secure, simple hosting</li>
            </ul>
            <p className="price">From £750</p>
          </div>
        </div>
      </section>

      <footer>
        <p>© {new Date().getFullYear()} SmartifyAI. All rights reserved.</p>
      </footer>
    </main>
  );
}
