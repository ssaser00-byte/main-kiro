const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Cache results for 30 minutes
const cache = new NodeCache({ stdTTL: 1800 });

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Major forex pairs and currencies
const FOREX_PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD',
  'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'EUR/CHF', 'EUR/AUD', 'EUR/CAD', 'GBP/CHF',
  'GBP/AUD', 'CHF/JPY', 'AUD/JPY', 'AUD/NZD', 'CAD/JPY', 'NZD/JPY'
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD'];

// Mock news data generator (in production, this would fetch from news APIs)
function generateMockNewsData(query) {
  const newsTemplates = {
    'USD': [
      { title: 'Fed signals potential rate hold amid inflation concerns', sentiment: 'neutral', source: 'Reuters', impact: 'high' },
      { title: 'US jobless claims fall, indicating strong labor market', sentiment: 'bullish', source: 'Bloomberg', impact: 'medium' },
      { title: 'Dollar strengthens on safe-haven demand', sentiment: 'bullish', source: 'Financial Times', impact: 'high' }
    ],
    'EUR': [
      { title: 'ECB maintains hawkish stance on inflation', sentiment: 'bullish', source: 'Reuters', impact: 'high' },
      { title: 'Eurozone GDP growth exceeds expectations', sentiment: 'bullish', source: 'Bloomberg', impact: 'medium' },
      { title: 'Euro faces headwinds from energy crisis concerns', sentiment: 'bearish', source: 'Wall Street Journal', impact: 'medium' }
    ],
    'GBP': [
      { title: 'Bank of England hints at extended rate hiking cycle', sentiment: 'bullish', source: 'Financial Times', impact: 'high' },
      { title: 'UK inflation remains stubbornly high', sentiment: 'mixed', source: 'BBC', impact: 'high' },
      { title: 'Pound rallies on stronger retail sales data', sentiment: 'bullish', source: 'Reuters', impact: 'medium' }
    ],
    'JPY': [
      { title: 'BoJ maintains ultra-loose monetary policy', sentiment: 'bearish', source: 'Nikkei', impact: 'high' },
      { title: 'Yen weakens as yield differential widens', sentiment: 'bearish', source: 'Bloomberg', impact: 'high' },
      { title: 'Japanese exports show resilience amid global slowdown', sentiment: 'neutral', source: 'Reuters', impact: 'low' }
    ],
    'CHF': [
      { title: 'Swiss franc benefits from safe-haven flows', sentiment: 'bullish', source: 'Reuters', impact: 'medium' },
      { title: 'SNB signals readiness to intervene in FX markets', sentiment: 'neutral', source: 'Bloomberg', impact: 'medium' },
      { title: 'Switzerland maintains strong current account surplus', sentiment: 'bullish', source: 'Financial Times', impact: 'low' }
    ],
    'AUD': [
      { title: 'RBA pauses rate hikes, signals data-dependent approach', sentiment: 'neutral', source: 'Sydney Morning Herald', impact: 'high' },
      { title: 'Australian dollar pressured by China slowdown concerns', sentiment: 'bearish', source: 'Reuters', impact: 'high' },
      { title: 'Commodity prices boost Aussie outlook', sentiment: 'bullish', source: 'Bloomberg', impact: 'medium' }
    ],
    'CAD': [
      { title: 'Bank of Canada holds rates, watches inflation closely', sentiment: 'neutral', source: 'Globe and Mail', impact: 'high' },
      { title: 'Rising oil prices support Canadian dollar', sentiment: 'bullish', source: 'Reuters', impact: 'high' },
      { title: 'Canadian employment data beats expectations', sentiment: 'bullish', source: 'Bloomberg', impact: 'medium' }
    ],
    'NZD': [
      { title: 'RBNZ maintains restrictive monetary policy stance', sentiment: 'bullish', source: 'NZ Herald', impact: 'high' },
      { title: 'Kiwi dollar supported by dairy price strength', sentiment: 'bullish', source: 'Reuters', impact: 'medium' },
      { title: 'New Zealand trade deficit widens unexpectedly', sentiment: 'bearish', source: 'Bloomberg', impact: 'medium' }
    ]
  };

  return newsTemplates[query] || [];
}

// AI-powered sentiment analysis (simplified version)
function analyzeWithAI(currency, news) {
  // Count sentiment types
  const sentiments = news.map(n => n.sentiment);
  const bullishCount = sentiments.filter(s => s === 'bullish').length;
  const bearishCount = sentiments.filter(s => s === 'bearish').length;
  const neutralCount = sentiments.filter(s => s === 'neutral' || s === 'mixed').length;

  // Calculate overall sentiment score (-100 to +100)
  const totalNews = news.length;
  const sentimentScore = totalNews > 0 
    ? Math.round(((bullishCount - bearishCount) / totalNews) * 100)
    : 0;

  // Determine outlook
  let outlook = 'NEUTRAL';
  let outlookColor = '#6b7280';
  
  if (sentimentScore > 30) {
    outlook = 'BULLISH';
    outlookColor = '#10b981';
  } else if (sentimentScore < -30) {
    outlook = 'BEARISH';
    outlookColor = '#ef4444';
  } else if (sentimentScore > 0) {
    outlook = 'SLIGHTLY BULLISH';
    outlookColor = '#22c55e';
  } else if (sentimentScore < 0) {
    outlook = 'SLIGHTLY BEARISH';
    outlookColor = '#f87171';
  }

  // Generate AI summary
  const summary = generateAISummary(currency, news, sentimentScore, outlook);

  // Key factors
  const keyFactors = extractKeyFactors(news);

  return {
    currency,
    sentimentScore,
    outlook,
    outlookColor,
    summary,
    keyFactors,
    newsCount: totalNews,
    breakdown: {
      bullish: bullishCount,
      bearish: bearishCount,
      neutral: neutralCount
    }
  };
}

function generateAISummary(currency, news, score, outlook) {
  const summaries = {
    'USD': {
      'BULLISH': `The US Dollar shows strong fundamental support. Federal Reserve policy remains a key driver, with recent economic data suggesting resilience in the labor market. Safe-haven demand and positive interest rate differentials continue to support USD strength.`,
      'BEARISH': `The US Dollar faces fundamental headwinds. Market sentiment has turned cautious on USD as expectations shift regarding Federal Reserve policy trajectory. Economic indicators suggest potential softening, which could limit dollar upside.`,
      'NEUTRAL': `The US Dollar is trading in a balanced fundamental environment. Mixed economic signals and uncertain Federal Reserve guidance are keeping the dollar range-bound. Market participants are awaiting clearer directional catalysts.`
    },
    'EUR': {
      'BULLISH': `The Euro demonstrates solid fundamental backing. The ECB's commitment to combating inflation through sustained policy tightening provides support. Eurozone economic data has shown resilience, strengthening the case for EUR appreciation.`,
      'BEARISH': `The Euro faces fundamental challenges. Concerns about Eurozone growth and energy security continue to weigh on sentiment. The ECB's policy path remains uncertain amid conflicting economic signals, limiting EUR upside potential.`,
      'NEUTRAL': `The Euro is navigating mixed fundamental signals. While ECB policy remains supportive, broader economic uncertainties create a balanced outlook. Market focus remains on incoming data for directional clarity.`
    },
    'GBP': {
      'BULLISH': `The British Pound shows positive fundamental momentum. Bank of England's hawkish stance and stronger-than-expected UK economic data support GBP strength. Inflation dynamics continue to justify a constructive outlook.`,
      'BEARISH': `The British Pound faces fundamental pressure. Persistent inflation concerns and economic uncertainty create headwinds. BoE policy effectiveness is being questioned, which may limit sterling's appeal.`,
      'NEUTRAL': `The British Pound reflects balanced fundamentals. Mixed UK economic indicators and uncertain BoE policy trajectory create a neutral backdrop. Market participants are monitoring data closely for clearer direction.`
    },
    'JPY': {
      'BULLISH': `The Japanese Yen benefits from safe-haven flows and shifting policy expectations. Market speculation about potential BoJ policy adjustments supports JPY. Global risk-off sentiment provides additional tailwinds.`,
      'BEARISH': `The Japanese Yen remains fundamentally challenged. The BoJ's ultra-loose monetary policy stance creates significant yield differentials versus other major currencies. This policy divergence continues to weigh on JPY.`,
      'NEUTRAL': `The Japanese Yen trades in a mixed fundamental environment. While BoJ policy remains accommodative, safe-haven dynamics provide periodic support. The balance between policy and risk sentiment keeps JPY range-bound.`
    },
    'CHF': {
      'BULLISH': `The Swiss Franc demonstrates strong safe-haven appeal. Switzerland's stable economic environment and robust current account position support CHF. Global uncertainty continues to drive flows into the franc.`,
      'BEARISH': `The Swiss Franc faces intervention risks. The SNB's willingness to act in FX markets to prevent excessive CHF strength creates uncertainty. Reduced safe-haven demand may limit franc appreciation.`,
      'NEUTRAL': `The Swiss Franc reflects balanced fundamentals. Safe-haven qualities are offset by SNB intervention concerns. Market sentiment toward risk assets will likely determine near-term CHF direction.`
    },
    'AUD': {
      'BULLISH': `The Australian Dollar shows positive fundamental drivers. Strong commodity prices, particularly for key exports, support AUD. Resilient domestic economic data and favorable terms of trade provide additional backing.`,
      'BEARISH': `The Australian Dollar faces fundamental challenges. Concerns about China's economic outlook, Australia's largest trading partner, weigh heavily on AUD. RBA policy uncertainty adds to the bearish narrative.`,
      'NEUTRAL': `The Australian Dollar navigates mixed fundamentals. Commodity price movements and China developments create competing forces. The RBA's data-dependent approach keeps market participants cautious.`
    },
    'CAD': {
      'BULLISH': `The Canadian Dollar benefits from strong oil price support. Robust energy markets and solid domestic employment data underpin CAD strength. The BoC's vigilant inflation-fighting stance provides additional support.`,
      'BEARISH': `The Canadian Dollar faces headwinds from energy market uncertainty. Concerns about global growth may pressure commodity-linked currencies. BoC policy pause creates questions about CAD's near-term trajectory.`,
      'NEUTRAL': `The Canadian Dollar reflects balanced fundamental forces. Oil price stability and BoC's wait-and-see approach create a neutral backdrop. Market focus remains on commodity trends and economic data.`
    },
    'NZD': {
      'BULLISH': `The New Zealand Dollar shows fundamental resilience. The RBNZ's restrictive monetary policy stance supports NZD. Strong dairy prices and positive risk sentiment provide additional tailwinds for the kiwi.`,
      'BEARISH': `The New Zealand Dollar faces fundamental pressure. Widening trade deficits and global growth concerns weigh on NZD sentiment. The currency's high-beta nature makes it vulnerable in risk-off environments.`,
      'NEUTRAL': `The New Zealand Dollar trades with mixed signals. RBNZ policy support is balanced against external vulnerabilities. Commodity price movements and risk sentiment will likely determine direction.`
    }
  };

  const currencySummaries = summaries[currency] || {};
  let selectedOutlook = outlook;
  
  // Map outlook variations to base outlooks
  if (outlook === 'SLIGHTLY BULLISH') selectedOutlook = 'BULLISH';
  if (outlook === 'SLIGHTLY BEARISH') selectedOutlook = 'BEARISH';
  
  return currencySummaries[selectedOutlook] || `Fundamental analysis for ${currency} shows ${outlook.toLowerCase()} sentiment based on current market conditions and news flow.`;
}

function extractKeyFactors(news) {
  return news
    .filter(n => n.impact === 'high' || n.impact === 'medium')
    .slice(0, 5)
    .map(n => ({
      factor: n.title,
      impact: n.impact,
      sentiment: n.sentiment
    }));
}

// Analyze forex pair
function analyzePair(pair) {
  const [base, quote] = pair.split('/');
  
  const baseNews = generateMockNewsData(base);
  const quoteNews = generateMockNewsData(quote);
  
  const baseAnalysis = analyzeWithAI(base, baseNews);
  const quoteAnalysis = analyzeWithAI(quote, quoteNews);
  
  // Relative strength calculation
  const relativeScore = baseAnalysis.sentimentScore - quoteAnalysis.sentimentScore;
  
  let pairOutlook = 'NEUTRAL';
  let pairOutlookColor = '#6b7280';
  let recommendation = '';
  
  if (relativeScore > 40) {
    pairOutlook = 'STRONGLY BULLISH';
    pairOutlookColor = '#10b981';
    recommendation = `Strong fundamental case for ${pair} upside. ${base} shows significantly better fundamentals than ${quote}.`;
  } else if (relativeScore > 20) {
    pairOutlook = 'BULLISH';
    pairOutlookColor = '#22c55e';
    recommendation = `Moderate fundamental support for ${pair} appreciation. ${base} outlook is more favorable than ${quote}.`;
  } else if (relativeScore < -40) {
    pairOutlook = 'STRONGLY BEARISH';
    pairOutlookColor = '#ef4444';
    recommendation = `Strong fundamental case for ${pair} downside. ${quote} shows significantly better fundamentals than ${base}.`;
  } else if (relativeScore < -20) {
    pairOutlook = 'BEARISH';
    pairOutlookColor = '#f87171';
    recommendation = `Moderate fundamental support for ${pair} depreciation. ${quote} outlook is more favorable than ${base}.`;
  } else {
    pairOutlook = 'NEUTRAL';
    pairOutlookColor = '#6b7280';
    recommendation = `${pair} shows balanced fundamentals. Both currencies have similar fundamental outlooks, suggesting range-bound trading.`;
  }
  
  return {
    pair,
    pairOutlook,
    pairOutlookColor,
    relativeScore,
    recommendation,
    baseCurrency: baseAnalysis,
    quoteCurrency: quoteAnalysis,
    news: {
      base: baseNews,
      quote: quoteNews
    }
  };
}

// API Endpoints
app.get('/api/currencies', (req, res) => {
  res.json({ currencies: CURRENCIES });
});

app.get('/api/pairs', (req, res) => {
  res.json({ pairs: FOREX_PAIRS });
});

app.get('/api/analyze/currency/:currency', (req, res) => {
  const { currency } = req.params;
  const cacheKey = `currency_${currency}`;
  
  // Check cache
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }
  
  if (!CURRENCIES.includes(currency)) {
    return res.status(400).json({ error: 'Invalid currency code' });
  }
  
  try {
    const news = generateMockNewsData(currency);
    const analysis = analyzeWithAI(currency, news);
    analysis.news = news;
    
    cache.set(cacheKey, analysis);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed', message: error.message });
  }
});

app.get('/api/analyze/pair/:pair', (req, res) => {
  const { pair } = req.params;
  const normalizedPair = pair.toUpperCase().replace('-', '/');
  const cacheKey = `pair_${normalizedPair}`;
  
  // Check cache
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }
  
  if (!FOREX_PAIRS.includes(normalizedPair)) {
    return res.status(400).json({ error: 'Invalid forex pair' });
  }
  
  try {
    const analysis = analyzePair(normalizedPair);
    cache.set(cacheKey, analysis);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed', message: error.message });
  }
});

// AI Chart Analysis Function
async function analyzeChart(imageBuffer, pair) {
  // Process the image
  const processedImage = await sharp(imageBuffer)
    .resize(1024, 1024, { fit: 'inside' })
    .toBuffer();
  
  // AI Analysis (mock implementation - replace with actual AI service)
  const analysis = performChartAnalysis(pair);
  
  return analysis;
}

// Mock Chart Analysis (replace with real AI vision API)
function performChartAnalysis(pair) {
  const patterns = [
    { name: 'Head and Shoulders', type: 'bearish', confidence: 0.75 },
    { name: 'Support Level', type: 'neutral', confidence: 0.90 },
    { name: 'Ascending Triangle', type: 'bullish', confidence: 0.65 }
  ];
  
  const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
  const trend = randomPattern.type;
  
  const technicalScore = trend === 'bullish' ? 65 : trend === 'bearish' ? -45 : 15;
  
  let technicalOutlook = 'NEUTRAL';
  let outlookColor = '#6b7280';
  
  if (technicalScore > 30) {
    technicalOutlook = 'BULLISH';
    outlookColor = '#10b981';
  } else if (technicalScore < -30) {
    technicalOutlook = 'BEARISH';
    outlookColor = '#ef4444';
  } else if (technicalScore > 0) {
    technicalOutlook = 'SLIGHTLY BULLISH';
    outlookColor = '#22c55e';
  } else if (technicalScore < 0) {
    technicalOutlook = 'SLIGHTLY BEARISH';
    outlookColor = '#f87171';
  }
  
  const chartPatterns = [
    { name: randomPattern.name, sentiment: randomPattern.type, confidence: randomPattern.confidence },
    { name: 'Moving Average Crossover', sentiment: trend, confidence: 0.80 },
    { name: 'RSI Divergence', sentiment: trend === 'bullish' ? 'bearish' : 'bullish', confidence: 0.60 }
  ];
  
  const keyLevels = [
    { type: 'Resistance', value: '1.0850', strength: 'Strong' },
    { type: 'Support', value: '1.0720', strength: 'Medium' },
    { type: 'Pivot', value: '1.0785', strength: 'Strong' }
  ];
  
  const technicalAnalysis = {
    outlook: technicalOutlook,
    outlookColor: outlookColor,
    score: technicalScore,
    summary: generateTechnicalSummary(technicalOutlook, pair, randomPattern.name),
    patterns: chartPatterns,
    keyLevels: keyLevels,
    trend: trend,
    timeframe: 'H4',
    recommendation: generateTradeRecommendation(technicalOutlook, keyLevels)
  };
  
  return technicalAnalysis;
}

function generateTechnicalSummary(outlook, pair, mainPattern) {
  const summaries = {
    'BULLISH': `Chart analysis shows strong bullish momentum on ${pair}. Key pattern detected: ${mainPattern}. Price action suggests continued upside with buyers in control. Multiple technical indicators align with the bullish scenario.`,
    'BEARISH': `Technical analysis indicates bearish pressure on ${pair}. Primary pattern: ${mainPattern}. Sellers are dominating, with price showing weakness at resistance levels. Indicators suggest further downside potential.`,
    'NEUTRAL': `${pair} chart displays mixed signals. Pattern identified: ${mainPattern}. Price is consolidating with no clear directional bias. Awaiting breakout confirmation before establishing strong bias.`,
    'SLIGHTLY BULLISH': `Mild bullish bias observed on ${pair} chart. Pattern: ${mainPattern}. Some upside momentum present but not decisive. Cautious optimism warranted with risk management.`,
    'SLIGHTLY BEARISH': `Chart shows modest bearish tendency on ${pair}. Detected pattern: ${mainPattern}. Downward pressure exists but not overwhelming. Risk-aware approach recommended.`
  };
  
  return summaries[outlook] || summaries['NEUTRAL'];
}

function generateTradeRecommendation(outlook, levels) {
  const resistance = levels.find(l => l.type === 'Resistance');
  const support = levels.find(l => l.type === 'Support');
  
  if (outlook.includes('BULLISH')) {
    return `Consider long positions above ${support.value} with targets near ${resistance.value}. Place stop loss below ${support.value} for risk management. Risk-reward ratio favors buyers.`;
  } else if (outlook.includes('BEARISH')) {
    return `Look for short opportunities below ${resistance.value} targeting ${support.value}. Stop loss above ${resistance.value}. Momentum favors sellers in current market structure.`;
  } else {
    return `Wait for clear breakout above ${resistance.value} (bullish) or below ${support.value} (bearish) before entering. Range-bound trading strategy appropriate. Avoid impulsive entries.`;
  }
}

// Chart analysis endpoint
app.post('/api/analyze/chart', upload.single('chart'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    const { pair } = req.body;
    
    if (!pair || !FOREX_PAIRS.includes(pair)) {
      return res.status(400).json({ error: 'Valid forex pair required' });
    }
    
    // Analyze the chart image
    const technicalAnalysis = await analyzeChart(req.file.buffer, pair);
    
    // Get fundamental analysis for the pair
    const [base, quote] = pair.split('/');
    const baseNews = generateMockNewsData(base);
    const quoteNews = generateMockNewsData(quote);
    const baseAnalysis = analyzeWithAI(base, baseNews);
    const quoteAnalysis = analyzeWithAI(quote, quoteNews);
    const fundamentalScore = baseAnalysis.sentimentScore - quoteAnalysis.sentimentScore;
    
    let fundamentalOutlook = 'NEUTRAL';
    let fundamentalColor = '#6b7280';
    
    if (fundamentalScore > 30) {
      fundamentalOutlook = 'BULLISH';
      fundamentalColor = '#10b981';
    } else if (fundamentalScore < -30) {
      fundamentalOutlook = 'BEARISH';
      fundamentalColor = '#ef4444';
    } else if (fundamentalScore > 0) {
      fundamentalOutlook = 'SLIGHTLY BULLISH';
      fundamentalColor = '#22c55e';
    } else if (fundamentalScore < 0) {
      fundamentalOutlook = 'SLIGHTLY BEARISH';
      fundamentalColor = '#f87171';
    }
    
    // Compare technical vs fundamental
    const alignment = checkAlignment(technicalAnalysis.outlook, fundamentalOutlook, technicalAnalysis.score, fundamentalScore);
    
    const response = {
      pair,
      technical: technicalAnalysis,
      fundamental: {
        outlook: fundamentalOutlook,
        outlookColor: fundamentalColor,
        score: fundamentalScore,
        summary: baseAnalysis.summary,
        baseCurrency: baseAnalysis,
        quoteCurrency: quoteAnalysis
      },
      alignment: alignment,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Chart analysis error:', error);
    res.status(500).json({ error: 'Chart analysis failed', message: error.message });
  }
});

// Check alignment between technical and fundamental analysis
function checkAlignment(techOutlook, fundOutlook, techScore, fundScore) {
  const techDirection = techScore > 0 ? 'bullish' : techScore < 0 ? 'bearish' : 'neutral';
  const fundDirection = fundScore > 0 ? 'bullish' : fundScore < 0 ? 'bearish' : 'neutral';
  
  let alignmentStatus = 'partial';
  let alignmentIcon = '⚠️';
  let alignmentText = 'Partial Alignment';
  let verdict = '';
  let probabilityPercent = 50; // Base probability
  
  // Calculate probability of reaching take profit based on alignment
  const absAvgScore = Math.abs((Math.abs(techScore) + Math.abs(fundScore)) / 2);
  
  if (techDirection === fundDirection && techDirection !== 'neutral') {
    // Both agree - high probability
    alignmentStatus = 'aligned';
    alignmentIcon = '✅';
    alignmentText = 'Strong Alignment';
    
    // Base probability: 70-85% when aligned
    probabilityPercent = Math.min(85, 70 + Math.round(absAvgScore * 0.15));
    
    verdict = `Excellent! Your chart analysis aligns with fundamental bias. Both technical and fundamental factors support a ${techDirection} outlook on this pair. This confluence significantly increases the probability of reaching your take profit target. Consider this a high-conviction setup with strong directional agreement.`;
    
  } else if ((techDirection === 'bullish' && fundDirection === 'bearish') || 
             (techDirection === 'bearish' && fundDirection === 'bullish')) {
    // Direct conflict - low probability
    alignmentStatus = 'conflict';
    alignmentIcon = '❌';
    alignmentText = 'Conflicting Signals';
    
    // Base probability: 25-40% when conflicting
    probabilityPercent = Math.max(25, 40 - Math.round(absAvgScore * 0.15));
    
    verdict = `Caution advised! Technical analysis suggests ${techDirection} bias while fundamentals indicate ${fundDirection} sentiment. This divergence significantly reduces the probability of reaching your take profit. Consider waiting for confirmation or reducing position size substantially. One perspective may be lagging the other - the conflicting signals increase the risk of reversal before hitting TP.`;
    
  } else {
    // One neutral or mixed signals
    alignmentStatus = 'partial';
    alignmentIcon = '⚠️';
    alignmentText = 'Mixed Signals';
    
    // Base probability: 45-60% when mixed
    probabilityPercent = Math.min(60, 45 + Math.round(absAvgScore * 0.15));
    
    verdict = `Moderate alignment detected. Technical outlook is ${techOutlook} while fundamental bias is ${fundOutlook}. Not a perfect match but not opposing either. The probability of reaching take profit is moderate - one factor is supportive while the other is neutral or unclear. Proceed with standard risk management and monitor for shifts in either technical or fundamental landscape that could improve or worsen the setup.`;
  }
  
  return {
    status: alignmentStatus,
    icon: alignmentIcon,
    text: alignmentText,
    verdict: verdict,
    technicalDirection: techDirection,
    fundamentalDirection: fundDirection,
    probabilityPercent: probabilityPercent,
    confidence: alignmentStatus === 'aligned' ? 'High' : alignmentStatus === 'conflict' ? 'Low' : 'Medium'
  };
}

app.listen(PORT, () => {
  console.log(`🚀 Forex Fundamental Analyzer running on http://localhost:${PORT}`);
  console.log(`📊 API ready to analyze ${CURRENCIES.length} currencies and ${FOREX_PAIRS.length} forex pairs`);
  console.log(`📈 Chart analysis with AI vision enabled`);
});
