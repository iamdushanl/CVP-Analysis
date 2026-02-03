# CVP Intelligence Dashboard 🚀

A comprehensive, AI-powered Cost-Volume-Profit (CVP) Analysis web application designed for modern business intelligence and financial planning.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Firebase](https://img.shields.io/badge/firebase-enabled-orange.svg)
![AI](https://img.shields.io/badge/AI-Gemini%20Powered-purple.svg)

## 🌟 Overview

CVP Intelligence Dashboard goes beyond traditional financial calculators by integrating **AI-driven insights** and **real-time cloud synchronization**. It enables businesses to analyze profitability, forecast performance, and explore "what-if" scenarios with the help of **Prismo**, an intelligent business assistant powered by Google's Gemini API.

## ✨ Key Features

### 🤖 AI Business Assistant (Prismo)
- **Natural Language Queries**: Ask questions like "What is my break-even point?" or "How can I improve my margin of safety?"
- **Data-Driven Insights**: Prismo has full context of your sales, products, and costs to provide tailored advice.
- **Strategic Recommendations**: Get actionable suggestions to optimize pricing and cost structures.

### ☁️ Cloud & Hybrid Storage
- **Firebase Integration**: Secure cloud storage for your critical business data.
- **Offline Capabilities**: robust `HybridDataManager` ensures you can work offline with local storage, syncing automatically when back online.
- **Real-time Sync**: Changes propagate instantly across devices.

### 📊 Advanced Analytics
- **Interactive Dashboard**: Real-time KPI tracking (Revenue, Profit, Contribution Margin).
- **CVP Calculator**: precise Break-even analysis, Margin of Safety, and P/V Ratio calculations.
- **Dynamic Heatmaps**: Visual performance analytics to identify top-performing products/regions.
- **Sales Forecasting**: Advanced algorithms to project future revenue trends.
- **Scenario Analysis**: "What-If" tools to model price changes, cost reductions, and volume shifts.

### 🔐 Security & Management
- **Secure Authentication**: Google Sign-In and Email/Password authentication via Firebase Auth.
- **Role-Based Access**: Secure data handling.
- **Product Management**: Comprehensive inventory and cost tracking.
- **Report Generation**: Professional PDF exports for stakeholders.

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3 (Modern Variables & Flexbox/Grid)
- **AI/LLM**: Google Gemini API (via `chatbot-service.js`)
- **Backend/Database**: Google Firebase (Firestore, Authentication)
- **Visualization**: Chart.js
- **Reporting**: jsPDF
- **Testing**: Jest (Unit & Integration tests)

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Edge, Firefox, Safari)
- Local web server (optional, but recommended for development)
- **Firebase Project**: You need a Firebase project with Firestore and Auth enabled.
- **Gemini API Key**: For the AI chatbot features.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/cvp-analysis.git
   cd cvp-analysis
   ```

2. **Configure Firebase**
   - Create a `firebase-config.js` file in the root directory (or update the existing one) with your Firebase credentials:
     ```javascript
     const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_PROJECT.firebaseapp.com",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_PROJECT.appspot.com",
       messagingSenderId: "YOUR_SENDER_ID",
       appId: "YOUR_APP_ID"
     };
     ```

3. **Configure AI Chatbot**
   - Ensure the `ChatbotService` in `chatbot-service.js` is configured with your secure or proxy endpoint for the Gemini API.

4. **Run Locally**
   You can use Python or Node.js to serve the files.

   **Using Python:**
   ```bash
   python -m http.server 8000
   ```

   **Using Node.js (http-server):**
   ```bash
   npx http-server -p 8000
   ```

5. **Access the App**
   Open your browser and navigate to `http://localhost:8000`.

## 📂 Project Structure

```
CVP-Analysis-main/
├── index.html              # Landing & Login page
├── pages/                  # Application Modules (Dashboard, Products, CVP, etc.)
├── assets/                 # Images and icons
├── __tests__/              # Jest unit tests
│
├── Core Services
│   ├── app.js              # meaningful app initialization
│   ├── auth.js             # Auth state management
│   ├── firebase-service.js # Firebase interaction layer
│   └── data-manager.js     # Hybrid data handling (Sync logic)
│
├── Domain Logic
│   ├── cvp-calculator.js   # Core financial math
│   ├── forecast-engine.js  # Prediction algorithms
│   └── heatmap-engine.js   # Visualization logic
│
├── AI Service
│   ├── chatbot-service.js  # Prismo AI implementation
│   ├── chatbot-ui.js       # Chat interface handling
│   └── chatbot-styles.css  # Chat specific styling
│
└── Utilities
    ├── csv-handler.js      # Data import/export
    └── components.js       # Shared UI components
```

## 🧪 Running Tests

This project uses **Jest** for unit testing to ensure calculation accuracy and system reliability.

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🤝 Contributing

Contributions are welcome! Please examine the `ACTION_PLAN.md` or `IMPLEMENTATION_STATUS.md` to see current progress and planned features.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---
**Built for the Future of Business Intelligence**
