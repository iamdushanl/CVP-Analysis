# CVP Intelligence Dashboard

> AI-powered Cost-Volume-Profit analysis for modern finance teams — real-time analytics, cloud sync, and conversational business intelligence in one platform.

![Version](https://img.shields.io/badge/version-2.0.0-6c63ff?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-22c55e?style=flat-square)
![Firebase](https://img.shields.io/badge/Firebase-enabled-f97316?style=flat-square&logo=firebase&logoColor=white)
![AI](https://img.shields.io/badge/Gemini-AI%20Powered-8b5cf6?style=flat-square&logo=google&logoColor=white)

---

## What is this?

CVP Intelligence Dashboard is a web-based financial planning tool that goes far beyond traditional break-even calculators. It combines precise CVP math with **Prismo** — an AI business assistant powered by Google's Gemini API — so you can ask plain-language questions about your data and get strategic, context-aware answers instantly.

Built for analysts, founders, and finance teams who need more than a spreadsheet.

---

## Features

### 🤖 Prismo — AI Business Assistant
Ask questions like *"What's my break-even point?"* or *"How can I improve my margin of safety?"* and get data-driven answers. Prismo has full context of your products, sales, and cost structure to provide tailored, actionable recommendations.

### ☁️ Hybrid Cloud Storage
Work online or offline without interruption. The `HybridDataManager` keeps your data in local storage when you're disconnected and syncs automatically with Firebase the moment you're back online.

### 📊 Interactive Analytics Dashboard
Real-time KPI tracking across Revenue, Profit, and Contribution Margin — with dynamic heatmaps to surface your top-performing products and regions at a glance.

### 🔢 CVP Calculator
Precise Break-even analysis, Margin of Safety calculations, and P/V Ratio reporting — the financial fundamentals, done right.

### 📈 Sales Forecasting & Scenario Analysis
Model the impact of price changes, cost reductions, and volume shifts with built-in "What-If" tools and algorithmic revenue projections.

### 🔐 Secure Authentication
Google Sign-In and email/password auth via Firebase, with role-based access control to keep sensitive financial data protected.

### 📄 PDF Report Generation
Export professional, stakeholder-ready reports from any view with a single click.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla JavaScript (ES6+), HTML5, CSS3 |
| AI / LLM | Google Gemini API |
| Backend & Database | Firebase (Firestore + Auth) |
| Visualization | Chart.js |
| Reporting | jsPDF |
| Testing | Jest |

---

## Getting Started

### Prerequisites

- A modern browser (Chrome, Edge, Firefox, or Safari)
- A [Firebase project](https://console.firebase.google.com/) with Firestore and Authentication enabled
- A Google [Gemini API key](https://aistudio.google.com/)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/YOUR-USERNAME/cvp-analysis.git
cd cvp-analysis
```

**2. Configure Firebase**

Create a `firebase-config.js` file in the project root:

```js
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
```

**3. Configure Prismo (AI Chatbot)**

Open `chatbot-service.js` and point `ChatbotService` to your Gemini API endpoint or proxy URL.

**4. Start a local server**

```bash
# Python
python -m http.server 8000

# Node.js
npx http-server -p 8000
```

**5. Open the app**

Navigate to `http://localhost:8000` in your browser.

---

## Project Structure

```
CVP-Analysis-main/
│
├── index.html                  # Landing & login page
├── pages/                      # App modules (Dashboard, Products, CVP, Forecast…)
├── assets/                     # Images & icons
├── __tests__/                  # Jest test suites
│
├── Core Services
│   ├── app.js                  # App initialization
│   ├── auth.js                 # Auth state management
│   ├── firebase-service.js     # Firebase interaction layer
│   └── data-manager.js         # Hybrid sync logic
│
├── Domain Logic
│   ├── cvp-calculator.js       # Core financial math
│   ├── forecast-engine.js      # Prediction algorithms
│   └── heatmap-engine.js       # Visualization logic
│
├── AI Service
│   ├── chatbot-service.js      # Prismo AI implementation
│   ├── chatbot-ui.js           # Chat interface handlers
│   └── chatbot-styles.css      # Chat-specific styles
│
└── Utilities
    ├── csv-handler.js          # Data import & export
    └── components.js           # Shared UI components
```

---

## Running Tests

This project uses **Jest** for unit and integration testing to ensure calculation accuracy and system reliability.

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

---

## Contributing

Contributions are welcome. Check `ACTION_PLAN.md` or `IMPLEMENTATION_STATUS.md` to see what's in progress and where help is needed.

1. Fork the repository
2. Create your feature branch — `git checkout -b feature/your-feature`
3. Commit your changes — `git commit -m 'Add your feature'`
4. Push to the branch — `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

Released under the [MIT License](LICENSE).

---

*Built for the future of business intelligence.*
