# CVP Intelligence Dashboard

A comprehensive Cost-Volume-Profit (CVP) Analysis web application for business intelligence and financial planning.
CVP Intelligence Dashboard

CVP Intelligence Dashboard is a comprehensive Cost–Volume–Profit (CVP) analysis web application designed to support business intelligence, financial planning, and data-driven decision-making.

The platform enables businesses to analyze profitability, forecast performance, and explore scenarios using interactive visualizations and professional reports—all while keeping data fully private within the browser.
## 🚀 Features

- **Dashboard Analytics**: Real-time KPI tracking and visualization
- **CVP Calculator**: Break-even analysis and profit planning
- **Product Management**: Comprehensive product and sales data management
- **What-If Analysis**: Scenario planning and sensitivity analysis
- **Forecasting**: Advanced sales and profit forecasting
- **Heatmap Analysis**: Visual performance analytics
- **Report Generation**: Professional PDF reports with insights
- **Data Import/Export**: CSV support for bulk operations

## 🎯 Live Demo

Visit the live application: https://cvpintelligence.online/
## 💻 Local Development

To run this application locally:

1. Clone the repository:
```bash
git clone https://github.com/YOUR-USERNAME/cvp-analysis.git
cd cvp-analysis
```

2. Start a local server:
```bash
# Using Python
python -m http.server 8000

# OR using Node.js
npx http-server -p 8000
```

3. Open your browser and navigate to:
```
http://localhost:8000
```

## 📊 Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Custom CSS with modern design patterns
- **Charts**: Chart.js for data visualization
- **PDF Generation**: jsPDF for report exports
- **Storage**: Browser localStorage for data persistence

## 🏗️ Project Structure

```
CVP Analysis/
├── index.html              # Main entry point
├── app.js                  # Application initialization
├── auth.js                 # Authentication logic
├── styles.css              # Main stylesheet
├── components.js           # Reusable UI components
├── data-manager.js         # Data management and storage
├── cvp-calculator.js       # CVP calculation engine
├── forecast-engine.js      # Forecasting algorithms
├── heatmap-engine.js       # Heatmap generation
├── csv-handler.js          # CSV import/export
├── settings-manager.js     # Application settings
└── pages/
    ├── dashboard.js        # Dashboard page
    ├── products.js         # Product management
    ├── sales.js            # Sales tracking
    ├── cvp.js              # CVP analysis
    ├── what-if.js          # Scenario analysis
    ├── forecast.js         # Forecasting page
    ├── heatmap.js          # Heatmap visualization
    ├── reports.js          # Report generation
    └── settings.js         # Settings page
```

## 📱 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Edge
- ✅ Safari
- ⚠️ IE11 (limited support)

## 🔒 Data Privacy

All data is stored locally in your browser using localStorage. No data is sent to external servers. Your business information remains completely private and secure.

## 📖 User Guide

### Getting Started

1. **Login**: Use the default credentials or create a new account
2. **Add Products**: Navigate to Products page and add your product catalog
3. **Record Sales**: Enter sales transactions in the Sales page
4. **Set Fixed Costs**: Configure your fixed costs in Settings
5. **Analyze**: Use the CVP Calculator and What-If Analysis tools
6. **Forecast**: Generate future projections in the Forecast page
7. **Report**: Export professional reports for stakeholders

### Key Concepts

- **Break-Even Point**: The sales volume where total revenue equals total costs
- **Contribution Margin**: Revenue minus variable costs
- **Margin of Safety**: How much sales can drop before reaching break-even
- **Operating Leverage**: The degree to which fixed costs are used in operations

## 🛠️ Configuration

The application uses LKR (Sri Lankan Rupees) as the default currency. To change this:

1. Navigate to Settings
2. Update currency preferences
3. Changes apply across all pages and reports

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

## 🙏 Acknowledgments

- Chart.js for beautiful data visualizations
- jsPDF for PDF generation capabilities
- The open-source community for inspiration and tools

---

**Built with ❤️ for better business intelligence**
