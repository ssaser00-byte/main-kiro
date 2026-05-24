const API_BASE = window.location.origin;

// DOM Elements
const currencySelect = document.getElementById('currency-select');
const pairSelect = document.getElementById('pair-select');
const analyzeCurrencyBtn = document.getElementById('analyze-currency-btn');
const analyzePairBtn = document.getElementById('analyze-pair-btn');
const currencyResults = document.getElementById('currency-results');
const pairResults = document.getElementById('pair-results');
const loading = document.getElementById('loading');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Initialize
async function init() {
    await loadCurrencies();
    await loadPairs();
    setupEventListeners();
}

// Load available currencies
async function loadCurrencies() {
    try {
        const response = await fetch(`${API_BASE}/api/currencies`);
        const data = await response.json();
        
        data.currencies.forEach(currency => {
            const option = document.createElement('option');
            option.value = currency;
            option.textContent = currency;
            currencySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load currencies:', error);
    }
}

// Load available pairs
async function loadPairs() {
    try {
        const response = await fetch(`${API_BASE}/api/pairs`);
        const data = await response.json();

        
        data.pairs.forEach(pair => {
            const option = document.createElement('option');
            option.value = pair;
            option.textContent = pair;
            pairSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load pairs:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            // Update active tab button
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update active tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });
    
    // Analysis buttons
    analyzeCurrencyBtn.addEventListener('click', analyzeCurrency);
    analyzePairBtn.addEventListener('click', analyzePair);
}

// Analyze currency
async function analyzeCurrency() {
    const currency = currencySelect.value;
    
    if (!currency) {
        alert('Please select a currency');
        return;
    }

    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE}/api/analyze/currency/${currency}`);
        const data = await response.json();
        
        if (response.ok) {
            displayCurrencyResults(data);
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        alert('Failed to analyze currency. Please try again.');
        console.error('Analysis error:', error);
    } finally {
        hideLoading();
    }
}

// Analyze pair
async function analyzePair() {
    const pair = pairSelect.value;
    
    if (!pair) {
        alert('Please select a forex pair');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE}/api/analyze/pair/${pair.replace('/', '-')}`);
        const data = await response.json();
        
        if (response.ok) {
            displayPairResults(data);
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        alert('Failed to analyze pair. Please try again.');
        console.error('Analysis error:', error);
    } finally {
        hideLoading();
    }
}



// Display currency results
function displayCurrencyResults(data) {
    document.getElementById('currency-name').textContent = `${data.currency} Analysis`;
    document.getElementById('currency-score').textContent = data.sentimentScore > 0 ? `+${data.sentimentScore}` : data.sentimentScore;
    
    const outlookBadge = document.getElementById('currency-outlook');
    outlookBadge.textContent = data.outlook;
    outlookBadge.style.background = data.outlookColor;
    
    document.getElementById('currency-summary').textContent = data.summary;
    
    // Breakdown bars
    const total = data.breakdown.bullish + data.breakdown.bearish + data.breakdown.neutral;
    document.getElementById('currency-bullish-bar').style.width = `${(data.breakdown.bullish / total) * 100}%`;
    document.getElementById('currency-bearish-bar').style.width = `${(data.breakdown.bearish / total) * 100}%`;
    document.getElementById('currency-neutral-bar').style.width = `${(data.breakdown.neutral / total) * 100}%`;
    
    document.getElementById('currency-bullish-count').textContent = data.breakdown.bullish;
    document.getElementById('currency-bearish-count').textContent = data.breakdown.bearish;
    document.getElementById('currency-neutral-count').textContent = data.breakdown.neutral;
    
    // Key factors
    const factorsContainer = document.getElementById('currency-factors');
    factorsContainer.innerHTML = data.keyFactors.map(factor => `
        <div class="factor-item">
            <strong>${factor.factor}</strong>
            <span class="factor-impact ${factor.impact}">${factor.impact} impact</span>
        </div>
    `).join('');

    
    // News items
    const newsContainer = document.getElementById('currency-news');
    newsContainer.innerHTML = data.news.map(item => `
        <div class="news-item">
            <div class="news-title">${item.title}</div>
            <div class="news-meta">
                <span>${item.source}</span>
                <span class="sentiment-tag ${item.sentiment}">${item.sentiment}</span>
                <span class="factor-impact ${item.impact}">${item.impact}</span>
            </div>
        </div>
    `).join('');
    
    currencyResults.classList.remove('hidden');
    currencyResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Display pair results
function displayPairResults(data) {
    document.getElementById('pair-name').textContent = `${data.pair} Analysis`;
    document.getElementById('pair-score').textContent = data.relativeScore > 0 ? `+${data.relativeScore}` : data.relativeScore;
    
    const outlookBadge = document.getElementById('pair-outlook');
    outlookBadge.textContent = data.pairOutlook;
    outlookBadge.style.background = data.pairOutlookColor;
    
    document.getElementById('pair-recommendation').textContent = data.recommendation;
    
    // Base currency
    document.getElementById('base-currency-title').textContent = data.baseCurrency.currency;
    const baseOutlook = document.getElementById('base-outlook');
    baseOutlook.textContent = data.baseCurrency.outlook;
    baseOutlook.style.background = data.baseCurrency.outlookColor;

    document.getElementById('base-score').textContent = data.baseCurrency.sentimentScore > 0 
        ? `+${data.baseCurrency.sentimentScore}` 
        : data.baseCurrency.sentimentScore;
    document.getElementById('base-summary').textContent = data.baseCurrency.summary.substring(0, 150) + '...';
    
    // Quote currency
    document.getElementById('quote-currency-title').textContent = data.quoteCurrency.currency;
    const quoteOutlook = document.getElementById('quote-outlook');
    quoteOutlook.textContent = data.quoteCurrency.outlook;
    quoteOutlook.style.background = data.quoteCurrency.outlookColor;
    document.getElementById('quote-score').textContent = data.quoteCurrency.sentimentScore > 0 
        ? `+${data.quoteCurrency.sentimentScore}` 
        : data.quoteCurrency.sentimentScore;
    document.getElementById('quote-summary').textContent = data.quoteCurrency.summary.substring(0, 150) + '...';
    
    // News columns
    document.getElementById('base-news-title').textContent = `📰 ${data.baseCurrency.currency} News`;
    document.getElementById('quote-news-title').textContent = `📰 ${data.quoteCurrency.currency} News`;
    
    const baseNewsContainer = document.getElementById('base-news');
    baseNewsContainer.innerHTML = data.news.base.map(item => `
        <div class="news-item">
            <div class="news-title">${item.title}</div>
            <div class="news-meta">
                <span>${item.source}</span>
                <span class="sentiment-tag ${item.sentiment}">${item.sentiment}</span>
            </div>
        </div>
    `).join('');

    
    const quoteNewsContainer = document.getElementById('quote-news');
    quoteNewsContainer.innerHTML = data.news.quote.map(item => `
        <div class="news-item">
            <div class="news-title">${item.title}</div>
            <div class="news-meta">
                <span>${item.source}</span>
                <span class="sentiment-tag ${item.sentiment}">${item.sentiment}</span>
            </div>
        </div>
    `).join('');
    
    pairResults.classList.remove('hidden');
    pairResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Loading state
function showLoading() {
    loading.classList.remove('hidden');
    currencyResults.classList.add('hidden');
    pairResults.classList.add('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

// Start the app
init();
