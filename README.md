<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CVP Intelligence Dashboard — README</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #0a0a0f;
    --surface: #111118;
    --surface2: #16161f;
    --border: rgba(255,255,255,0.07);
    --accent: #7c6af7;
    --accent2: #3ecfcf;
    --accent3: #f7846a;
    --text: #e8e8f0;
    --muted: #6b6b80;
    --code-bg: #0d0d14;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Outfit', sans-serif;
    font-size: 15px;
    line-height: 1.75;
    min-height: 100vh;
  }

  /* Ambient background */
  body::before {
    content: '';
    position: fixed;
    top: -40%;
    left: -20%;
    width: 70%;
    height: 70%;
    background: radial-gradient(ellipse, rgba(124,106,247,0.08) 0%, transparent 65%);
    pointer-events: none;
    z-index: 0;
  }
  body::after {
    content: '';
    position: fixed;
    bottom: -30%;
    right: -10%;
    width: 55%;
    height: 55%;
    background: radial-gradient(ellipse, rgba(62,207,207,0.06) 0%, transparent 65%);
    pointer-events: none;
    z-index: 0;
  }

  .container {
    max-width: 860px;
    margin: 0 auto;
    padding: 80px 32px 120px;
    position: relative;
    z-index: 1;
  }

  /* Header */
  header {
    margin-bottom: 72px;
    padding-bottom: 48px;
    border-bottom: 1px solid var(--border);
  }

  .eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--accent2);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .eyebrow::before {
    content: '';
    display: inline-block;
    width: 24px;
    height: 1px;
    background: var(--accent2);
  }

  h1 {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(38px, 6vw, 58px);
    line-height: 1.1;
    font-weight: 400;
    letter-spacing: -0.01em;
    margin-bottom: 20px;
  }

  h1 em {
    font-style: italic;
    color: var(--accent);
  }

  .subtitle {
    font-size: 17px;
    color: var(--muted);
    font-weight: 300;
    max-width: 560px;
    line-height: 1.65;
    margin-bottom: 32px;
  }

  .badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 100px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.04em;
    border: 1px solid;
  }

  .badge-purple { color: #a89af8; border-color: rgba(168,154,248,0.3); background: rgba(124,106,247,0.08); }
  .badge-teal   { color: #5edada; border-color: rgba(94,218,218,0.3); background: rgba(62,207,207,0.08); }
  .badge-orange { color: #f9a07e; border-color: rgba(249,160,126,0.3); background: rgba(247,132,106,0.08); }
  .badge-green  { color: #7de8a0; border-color: rgba(125,232,160,0.3); background: rgba(76,210,125,0.08); }

  /* Sections */
  section { margin-bottom: 56px; }

  h2 {
    font-family: 'DM Serif Display', serif;
    font-size: 26px;
    font-weight: 400;
    color: var(--text);
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  h2 .icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(124,106,247,0.15);
    border: 1px solid rgba(124,106,247,0.25);
    display: grid;
    place-items: center;
    font-size: 16px;
    flex-shrink: 0;
  }

  h3 {
    font-size: 13px;
    font-family: 'DM Mono', monospace;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 10px;
    margin-top: 28px;
  }

  p {
    color: #c0c0d0;
    margin-bottom: 14px;
  }

  /* Feature cards */
  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 24px;
  }

  .feature-card {
    background: var(--surface);
    padding: 28px 24px;
    transition: background 0.2s;
  }
  .feature-card:hover { background: var(--surface2); }

  .feature-icon {
    font-size: 22px;
    margin-bottom: 12px;
    display: block;
  }

  .feature-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 8px;
  }

  .feature-desc {
    font-size: 13.5px;
    color: var(--muted);
    line-height: 1.6;
    margin-bottom: 0;
  }

  /* Tech stack */
  .stack-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    gap: 12px;
  }

  .stack-item {
    padding: 14px 16px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13.5px;
    color: var(--text);
    transition: border-color 0.2s, transform 0.15s;
  }
  .stack-item:hover {
    border-color: rgba(124,106,247,0.4);
    transform: translateY(-1px);
  }

  .stack-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  /* Code blocks */
  pre, code {
    font-family: 'DM Mono', monospace;
  }

  .code-block {
    background: var(--code-bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    margin: 16px 0;
  }

  .code-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
  }

  .code-dot {
    width: 10px; height: 10px; border-radius: 50%;
  }

  .code-label {
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.08em;
    margin-left: auto;
    font-family: 'DM Mono', monospace;
  }

  pre {
    padding: 20px 20px;
    font-size: 13px;
    line-height: 1.7;
    overflow-x: auto;
    color: #c8c8e0;
  }

  .kw   { color: #a89af8; }
  .str  { color: #7de8b0; }
  .cmt  { color: #4a4a60; font-style: italic; }
  .key  { color: #f9a07e; }

  /* File tree */
  .file-tree {
    background: var(--code-bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px 24px;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    line-height: 1.9;
    color: #c0c0d8;
  }

  .tree-dir   { color: var(--accent2); font-weight: 500; }
  .tree-file  { color: #9090b0; }
  .tree-label { color: var(--muted); font-style: italic; margin-left: 8px; }

  /* Steps */
  .steps { display: flex; flex-direction: column; gap: 0; }

  .step {
    display: flex;
    gap: 20px;
    padding-bottom: 32px;
    position: relative;
  }

  .step:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 16px;
    top: 36px;
    bottom: 0;
    width: 1px;
    background: var(--border);
  }

  .step-num {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(124,106,247,0.12);
    border: 1px solid rgba(124,106,247,0.3);
    display: grid;
    place-items: center;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: var(--accent);
    flex-shrink: 0;
    margin-top: 1px;
  }

  .step-body h3 {
    margin-top: 4px;
    margin-bottom: 6px;
    font-size: 13px;
  }

  .step-body p {
    font-size: 14px;
    color: #9090aa;
    margin-bottom: 10px;
  }

  /* Contribute cards */
  .contribute-row {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
    margin-top: 16px;
  }

  .contribute-card {
    padding: 18px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    font-size: 13.5px;
  }

  .contribute-card .step-num {
    width: 26px;
    height: 26px;
    font-size: 11px;
    margin-bottom: 10px;
  }

  .contribute-card p {
    font-size: 13px;
    color: var(--muted);
    margin: 0;
  }

  /* Footer */
  footer {
    margin-top: 80px;
    padding-top: 32px;
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: gap;
    gap: 12px;
  }

  .footer-left {
    font-size: 13px;
    color: var(--muted);
  }

  .footer-badge {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--accent2);
    border: 1px solid rgba(62,207,207,0.25);
    background: rgba(62,207,207,0.06);
    padding: 6px 14px;
    border-radius: 100px;
  }

  /* Divider */
  hr {
    border: none;
    border-top: 1px solid var(--border);
    margin: 40px 0;
  }

  /* Animations */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  header    { animation: fadeUp 0.5s ease both; }
  section:nth-child(1) { animation: fadeUp 0.5s 0.08s ease both; }
  section:nth-child(2) { animation: fadeUp 0.5s 0.14s ease both; }
  section:nth-child(3) { animation: fadeUp 0.5s 0.20s ease both; }
  section:nth-child(4) { animation: fadeUp 0.5s 0.26s ease both; }
  section:nth-child(5) { animation: fadeUp 0.5s 0.32s ease both; }
  section:nth-child(6) { animation: fadeUp 0.5s 0.38s ease both; }
</style>
</head>
<body>
<div class="container">

  <!-- Header -->
  <header>
    <div class="eyebrow">Documentation — v2.0.0</div>
    <h1>CVP <em>Intelligence</em><br>Dashboard</h1>
    <p class="subtitle">A next-generation, AI-powered Cost-Volume-Profit analysis platform built for modern finance teams — combining real-time analytics, cloud sync, and conversational business intelligence.</p>
    <div class="badges">
      <span class="badge badge-purple">⬡ v2.0.0 Stable</span>
      <span class="badge badge-green">MIT License</span>
      <span class="badge badge-orange">Firebase Enabled</span>
      <span class="badge badge-teal">✦ Gemini AI</span>
    </div>
  </header>

  <!-- Overview -->
  <section>
    <h2><span class="icon">◎</span> Overview</h2>
    <p>CVP Intelligence Dashboard goes far beyond traditional financial calculators. At its core is <strong style="color:var(--text)">Prismo</strong> — an AI business assistant powered by Google's Gemini API — that understands your live data and answers complex questions in plain language. Paired with Firebase-backed cloud sync and a rich interactive analytics suite, this platform is designed to be the single source of truth for your profitability decisions.</p>
  </section>

  <!-- Features -->
  <section>
    <h2><span class="icon">◈</span> Key Features</h2>
    <div class="feature-grid">
      <div class="feature-card">
        <span class="feature-icon">🤖</span>
        <div class="feature-title">Prismo AI Assistant</div>
        <p class="feature-desc">Ask natural-language questions like "What is my break-even point?" and receive data-driven, context-aware answers with strategic recommendations.</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">☁️</span>
        <div class="feature-title">Hybrid Cloud Storage</div>
        <p class="feature-desc">Work online or offline seamlessly. The <code style="font-family:'DM Mono',monospace;font-size:12px;color:var(--accent2)">HybridDataManager</code> syncs local state with Firebase the moment you reconnect.</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">📊</span>
        <div class="feature-title">Advanced Analytics</div>
        <p class="feature-desc">Real-time KPI dashboards, break-even analysis, P/V ratio calculations, dynamic heatmaps, and multi-variable scenario modeling.</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">📈</span>
        <div class="feature-title">Sales Forecasting</div>
        <p class="feature-desc">Algorithmic revenue projections and "What-If" scenario tools to simulate the impact of price changes, volume shifts, and cost reductions.</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">🔐</span>
        <div class="feature-title">Secure Authentication</div>
        <p class="feature-desc">Google Sign-In and email/password auth via Firebase. Role-based access control keeps sensitive financial data protected.</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">📄</span>
        <div class="feature-title">PDF Reporting</div>
        <p class="feature-desc">Generate professional, stakeholder-ready reports from any dashboard view with a single click via jsPDF integration.</p>
      </div>
    </div>
  </section>

  <!-- Tech Stack -->
  <section>
    <h2><span class="icon">⬡</span> Technology Stack</h2>
    <div class="stack-grid">
      <div class="stack-item"><div class="stack-dot" style="background:#f7c948"></div>Vanilla JS (ES6+)</div>
      <div class="stack-item"><div class="stack-dot" style="background:#e34c26"></div>HTML5 / CSS3</div>
      <div class="stack-item"><div class="stack-dot" style="background:#a89af8"></div>Google Gemini API</div>
      <div class="stack-item"><div class="stack-dot" style="background:#f9a07e"></div>Firebase / Firestore</div>
      <div class="stack-item"><div class="stack-dot" style="background:#5edada"></div>Chart.js</div>
      <div class="stack-item"><div class="stack-dot" style="background:#7de8a0"></div>jsPDF</div>
      <div class="stack-item"><div class="stack-dot" style="background:#c9a0f7"></div>Jest</div>
    </div>
  </section>

  <!-- Getting Started -->
  <section>
    <h2><span class="icon">▷</span> Getting Started</h2>
    <div class="steps">

      <div class="step">
        <div class="step-num">1</div>
        <div class="step-body">
          <h3>Clone the Repository</h3>
          <div class="code-block">
            <div class="code-header">
              <div class="code-dot" style="background:#ff5f57"></div>
              <div class="code-dot" style="background:#febc2e"></div>
              <div class="code-dot" style="background:#28c840"></div>
              <span class="code-label">bash</span>
            </div>
            <pre><span class="kw">git</span> clone https://github.com/YOUR-USERNAME/cvp-analysis.git
<span class="kw">cd</span> cvp-analysis</pre>
          </div>
        </div>
      </div>

      <div class="step">
        <div class="step-num">2</div>
        <div class="step-body">
          <h3>Configure Firebase</h3>
          <p>Create a <code style="font-family:'DM Mono',monospace;color:var(--accent2);font-size:12px">firebase-config.js</code> in the project root with your Firebase project credentials.</p>
          <div class="code-block">
            <div class="code-header">
              <div class="code-dot" style="background:#ff5f57"></div>
              <div class="code-dot" style="background:#febc2e"></div>
              <div class="code-dot" style="background:#28c840"></div>
              <span class="code-label">firebase-config.js</span>
            </div>
            <pre><span class="kw">const</span> firebaseConfig = {
  <span class="key">apiKey</span>:            <span class="str">"YOUR_API_KEY"</span>,
  <span class="key">authDomain</span>:        <span class="str">"YOUR_PROJECT.firebaseapp.com"</span>,
  <span class="key">projectId</span>:         <span class="str">"YOUR_PROJECT_ID"</span>,
  <span class="key">storageBucket</span>:     <span class="str">"YOUR_PROJECT.appspot.com"</span>,
  <span class="key">messagingSenderId</span>: <span class="str">"YOUR_SENDER_ID"</span>,
  <span class="key">appId</span>:             <span class="str">"YOUR_APP_ID"</span>
};</pre>
          </div>
        </div>
      </div>

      <div class="step">
        <div class="step-num">3</div>
        <div class="step-body">
          <h3>Configure the AI Chatbot</h3>
          <p>Set your Gemini API endpoint or proxy URL inside <code style="font-family:'DM Mono',monospace;color:var(--accent2);font-size:12px">chatbot-service.js</code> to enable Prismo.</p>
        </div>
      </div>

      <div class="step">
        <div class="step-num">4</div>
        <div class="step-body">
          <h3>Serve Locally</h3>
          <div class="code-block">
            <div class="code-header">
              <div class="code-dot" style="background:#ff5f57"></div>
              <div class="code-dot" style="background:#febc2e"></div>
              <div class="code-dot" style="background:#28c840"></div>
              <span class="code-label">Python · Node</span>
            </div>
            <pre><span class="cmt"># Python</span>
python -m http.server 8000

<span class="cmt"># Node.js</span>
npx http-server -p 8000</pre>
          </div>
          <p>Then open <strong style="color:var(--accent2);font-family:'DM Mono',monospace;font-size:12px">http://localhost:8000</strong> in your browser.</p>
        </div>
      </div>

    </div>
  </section>

  <!-- Project Structure -->
  <section>
    <h2><span class="icon">⊞</span> Project Structure</h2>
    <div class="file-tree">
<span class="tree-dir">CVP-Analysis-main/</span>
├── index.html             <span class="tree-label">Landing &amp; authentication</span>
├── pages/                 <span class="tree-label">Dashboard, Products, CVP, Forecast…</span>
├── assets/                <span class="tree-label">Images &amp; icons</span>
├── __tests__/             <span class="tree-label">Jest unit &amp; integration tests</span>
│
├── <span class="tree-dir">Core Services</span>
│   ├── app.js             <span class="tree-label">App initialization</span>
│   ├── auth.js            <span class="tree-label">Auth state management</span>
│   ├── firebase-service.js<span class="tree-label">Firebase interaction layer</span>
│   └── data-manager.js    <span class="tree-label">Hybrid sync logic</span>
│
├── <span class="tree-dir">Domain Logic</span>
│   ├── cvp-calculator.js  <span class="tree-label">Core financial math</span>
│   ├── forecast-engine.js <span class="tree-label">Prediction algorithms</span>
│   └── heatmap-engine.js  <span class="tree-label">Visualization logic</span>
│
├── <span class="tree-dir">AI Service</span>
│   ├── chatbot-service.js <span class="tree-label">Prismo implementation</span>
│   ├── chatbot-ui.js      <span class="tree-label">Chat interface handlers</span>
│   └── chatbot-styles.css <span class="tree-label">Chat-specific styling</span>
│
└── <span class="tree-dir">Utilities</span>
    ├── csv-handler.js     <span class="tree-label">Data import &amp; export</span>
    └── components.js      <span class="tree-label">Shared UI components</span>
    </div>
  </section>

  <!-- Testing -->
  <section>
    <h2><span class="icon">✓</span> Running Tests</h2>
    <p>The project uses <strong style="color:var(--text)">Jest</strong> to ensure calculation accuracy and system reliability across unit and integration test suites.</p>
    <div class="code-block">
      <div class="code-header">
        <div class="code-dot" style="background:#ff5f57"></div>
        <div class="code-dot" style="background:#febc2e"></div>
        <div class="code-dot" style="background:#28c840"></div>
        <span class="code-label">bash</span>
      </div>
      <pre><span class="cmt"># Install dependencies</span>
npm install

<span class="cmt"># Run all tests</span>
npm test

<span class="cmt"># Run with coverage report</span>
npm run test:coverage</pre>
    </div>
  </section>

  <!-- Contributing -->
  <section>
    <h2><span class="icon">◇</span> Contributing</h2>
    <p>Contributions are welcome. Check <code style="font-family:'DM Mono',monospace;color:var(--accent2);font-size:12px">ACTION_PLAN.md</code> or <code style="font-family:'DM Mono',monospace;color:var(--accent2);font-size:12px">IMPLEMENTATION_STATUS.md</code> for current progress and open areas to contribute.</p>
    <div class="contribute-row">
      <div class="contribute-card">
        <div class="step-num">1</div>
        <p>Fork the project on GitHub</p>
      </div>
      <div class="contribute-card">
        <div class="step-num">2</div>
        <p>Create a feature branch</p>
      </div>
      <div class="contribute-card">
        <div class="step-num">3</div>
        <p>Commit &amp; push your changes</p>
      </div>
      <div class="contribute-card">
        <div class="step-num">4</div>
        <p>Open a Pull Request</p>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer>
    <div class="footer-left">Licensed under the <strong style="color:var(--text)">MIT License</strong> · Built for the future of business intelligence.</div>
    <div class="footer-badge">CVP Intelligence v2.0.0</div>
  </footer>

</div>
</body>
</html>
