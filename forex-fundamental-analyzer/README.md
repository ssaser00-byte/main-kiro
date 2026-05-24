# 🌐 Forex Fundamental Analyzer

An AI-powered web application that analyzes forex market fundamentals, news sentiment, and provides intelligent trading insights for currency pairs.

## 🚀 Features

- **Single Currency Analysis**: Get comprehensive fundamental analysis for individual currencies (USD, EUR, GBP, JPY, etc.)
- **Currency Pair Analysis**: Compare two currencies and get relative strength assessments
- **AI-Powered Sentiment Analysis**: Intelligent news sentiment scoring and outlook generation
- **Real-time News Aggregation**: Latest forex news with impact ratings
- **Visual Dashboards**: Interactive charts showing sentiment breakdowns and key factors
- **20+ Major Forex Pairs**: Coverage of all major and cross currency pairs

## 📋 Supported Currencies

- **USD** - US Dollar
- **EUR** - Euro
- **GBP** - British Pound
- **JPY** - Japanese Yen
- **CHF** - Swiss Franc
- **AUD** - Australian Dollar
- **CAD** - Canadian Dollar
- **NZD** - New Zealand Dollar

## 💻 Installation

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Setup Steps

1. **Clone or navigate to the project directory**:
   ```bash
   cd forex-fundamental-analyzer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment** (optional):
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to add API keys if using real-time data sources.

4. **Start the server**:
   ```bash
   npm start
   ```

5. **Open your browser**:

   Navigate to `http://localhost:3000`

The application will be running and ready to analyze forex pairs!

## 🎯 How to Use

### Analyzing a Single Currency

1. Click the **"Single Currency"** tab
2. Select a currency from the dropdown (e.g., USD, EUR, GBP)
3. Click **"Analyze Currency"**
4. View the comprehensive analysis including:
   - Sentiment score (-100 to +100)
   - Overall outlook (Bullish/Bearish/Neutral)
   - AI-generated summary
   - News sentiment breakdown
   - Key fundamental factors
   - Latest news articles

### Analyzing a Currency Pair

1. Click the **"Currency Pair"** tab
2. Select a forex pair (e.g., EUR/USD, GBP/JPY)
3. Click **"Analyze Pair"**
4. View the relative analysis including:
   - Relative strength score
   - Pair outlook and recommendation
   - Side-by-side currency comparison
   - Individual currency analyses
   - News for both currencies

## 🔧 Architecture

### Backend (Node.js + Express)

- **server.js**: Main API server handling analysis requests
- REST API endpoints for currency and pair analysis
- In-memory caching for performance (30-minute TTL)
- AI-powered sentiment analysis engine

### Frontend (Vanilla JavaScript)

- **public/index.html**: Single-page application structure
- **public/styles.css**: Modern, responsive design
- **public/app.js**: Dynamic UI and API interactions
- Real-time updates and smooth animations

## 📊 API Endpoints

### GET `/api/currencies`
Returns list of supported currencies.

### GET `/api/pairs`
Returns list of available forex pairs.

### GET `/api/analyze/currency/:currency`
Analyzes a single currency and returns:
- Sentiment score
- Outlook (Bullish/Bearish/Neutral)
- AI summary
- News breakdown
- Key factors
- Recent news articles

### GET `/api/analyze/pair/:pair`
Analyzes a currency pair and returns:
- Relative strength score
- Pair outlook
- Trading recommendation
- Individual currency analyses
- News for both currencies

## 🚀 Future Enhancements

### Phase 1 (Current - Mock Data)
✅ Core UI and analysis engine
✅ AI sentiment analysis
✅ Mock news data for testing

### Phase 2 (Real-time Data Integration)
- [ ] Integrate NewsAPI for real-time forex news
- [ ] Connect to financial data APIs (Alpha Vantage, FRED)
- [ ] Economic calendar integration
- [ ] Historical sentiment tracking

### Phase 3 (Advanced AI)
- [ ] OpenAI GPT integration for deeper analysis
- [ ] Natural language processing for news articles
- [ ] Sentiment trend predictions
- [ ] Custom alerts and notifications

### Phase 4 (Professional Features)
- [ ] User accounts and saved analyses
- [ ] Custom watchlists
- [ ] PDF report generation
- [ ] Mobile app version

## 🔌 Integrating Real Data Sources

To upgrade from mock data to real-time analysis:

1. **News API** (for forex news):
   - Sign up at https://newsapi.org
   - Add key to `.env`
   - Update `generateMockNewsData()` function

2. **Alpha Vantage** (for economic data):
   - Get free API key from https://www.alphavantage.co
   - Fetch currency exchange rates and economic indicators

3. **OpenAI API** (for enhanced AI analysis):
   - Get API key from https://platform.openai.com
   - Replace sentiment analysis logic with GPT-4 calls

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Caching**: node-cache
- **HTTP Client**: Axios
- **Environment**: dotenv

## 📝 Notes

- **Current Version**: Uses intelligent mock data to demonstrate functionality
- **Caching**: Results cached for 30 minutes to reduce API calls
- **Responsive**: Works on desktop, tablet, and mobile devices
- **No Authentication**: Currently open access (add auth for production)

## 🤝 Contributing

This is a demo project. Feel free to:
- Add more currency pairs
- Integrate real APIs
- Enhance the AI analysis
- Improve the UI/UX
- Add new features

## 📄 License

MIT License - Feel free to use and modify as needed.

## 🆘 Troubleshooting

**Port already in use?**
- Change the PORT in `.env` file
- Or kill the process: `lsof -ti:3000 | xargs kill`

**Dependencies not installing?**
- Ensure Node.js >= 18.x is installed
- Try `npm cache clean --force` then reinstall

**Analysis not loading?**
- Check browser console for errors
- Verify server is running on correct port
- Check network tab in browser DevTools

---

**Built with ❤️ for Forex Traders**
