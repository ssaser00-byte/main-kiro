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

// Chart analysis elements
const currencySelectChart = document.getElementById('currency-select-chart');
const uploadArea = document.getElementById('upload-area');
const chartUpload = document.getElementById('chart-upload');
const imagePreview = document.getElementById('image-preview');
const previewImg = document.getElementById('preview-img');
const removeImageBtn = document.getElementById('remove-image');
const analyzeChartBtn = document.getElementById('analyze-chart-btn');
const chartResults = document.getElementById('chart-results');

let selectedChartFile = null;

// Initialize
async function init() {
    await loadCurrencies();
    await loadPairs();
    await loadPairsForChart();
    setupEventListeners();
    setupChartUpload();
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

// Load pairs for chart analysis
async function loadPairsForChart() {
    try {
        const response = await fetch(`${API_BASE}/api/pairs`);
        const data = await response.json();
        
        data.pairs.forEach(pair => {
            const option = document.createElement('option');
            option.value = pair;
            option.textContent = pair;
            currencySelectChart.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load pairs for chart:', error);
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

// Setup chart upload functionality
function setupChartUpload() {
    // Click to upload
    uploadArea.addEventListener('click', () => {
        chartUpload.click();
    });
    
    // File selection
    chartUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleChartFile(file);
        }
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleChartFile(file);
        }
    });
    
    // Remove image
    removeImageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedChartFile = null;
        imagePreview.classList.add('hidden');
        uploadArea.classList.remove('hidden');
        chartUpload.value = '';
        analyzeChartBtn.disabled = true;
    });
    
    // Analyze chart
    analyzeChartBtn.addEventListener('click', analyzeChart);
}

// Handle chart file selection
function handleChartFile(file) {
    selectedChartFile = file;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        imagePreview.classList.remove('hidden');
        uploadArea.classList.add('hidden');
        
        // Enable analyze button if pair is selected
        if (currencySelectChart.value) {
            analyzeChartBtn.disabled = false;
        }
    };
    reader.readAsDataURL(file);
}

// Enable/disable analyze button based on selections
currencySelectChart.addEventListener('change', () => {
    if (currencySelectChart.value && selectedChartFile) {
        analyzeChartBtn.disabled = false;
    }
});

// Analyze chart with AI
async function analyzeChart() {
    const pair = currencySelectChart.value;
    
    if (!pair || !selectedChartFile) {
        alert('Please select a pair and upload a chart image');
        return;
    }
    
    showLoading();
    
    try {
        const formData = new FormData();
        formData.append('chart', selectedChartFile);
        formData.append('pair', pair);
        
        const response = await fetch(`${API_BASE}/api/analyze/chart`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayChartResults(data);
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        alert('Failed to analyze chart. Please try again.');
        console.error('Chart analysis error:', error);
    } finally {
        hideLoading();
    }
}

// Display chart analysis results
function displayChartResults(data) {
    document.getElementById('chart-pair-name').textContent = `${data.pair} - Chart Analysis`;
    
    // Technical Analysis
    const techOutlook = document.getElementById('technical-outlook');
    techOutlook.textContent = data.technical.outlook;
    techOutlook.style.background = data.technical.outlookColor;
    document.getElementById('technical-analysis').innerHTML = `
        <p><strong>Score:</strong> ${data.technical.score > 0 ? '+' : ''}${data.technical.score}</p>
        <p style="margin-top: 10px;">${data.technical.summary}</p>
    `;
    
    // Fundamental Analysis
    const fundOutlook = document.getElementById('fundamental-outlook');
    fundOutlook.textContent = data.fundamental.outlook;
    fundOutlook.style.background = data.fundamental.outlookColor;
    document.getElementById('fundamental-analysis').innerHTML = `
        <p><strong>Score:</strong> ${data.fundamental.score > 0 ? '+' : ''}${data.fundamental.score}</p>
        <p style="margin-top: 10px;">${data.fundamental.summary}</p>
    `;
    
    // Alignment Status
    const alignmentDiv = document.getElementById('alignment-status');
    alignmentDiv.className = `alignment-indicator ${data.alignment.status}`;
    alignmentDiv.innerHTML = `
        <div class="alignment-icon">${data.alignment.icon}</div>
        <div class="alignment-text">${data.alignment.text}</div>
        <div style="margin-top: 10px; font-size: 1.2rem; font-weight: 700; color: #1f2937;">
            ${data.alignment.probabilityPercent}% Probability
        </div>
        <div style="margin-top: 5px; font-size: 0.85rem; color: #6b7280;">
            Chance of reaching take profit
        </div>
    `;
    
    // AI Verdict
    document.getElementById('verdict-text').textContent = data.alignment.verdict;
    
    // Chart Patterns
    const patternsHtml = data.technical.patterns.map(pattern => `
        <span class="pattern-badge ${pattern.sentiment}">
            ${pattern.name} (${Math.round(pattern.confidence * 100)}%)
        </span>
    `).join('');
    document.getElementById('patterns-list').innerHTML = patternsHtml;
    
    // Key Levels
    const levelsHtml = data.technical.keyLevels.map(level => `
        <p><strong>${level.type}:</strong> ${level.value} <span style="color: #6b7280;">(${level.strength})</span></p>
    `).join('');
    document.getElementById('levels-list').innerHTML = levelsHtml;
    
    // Trade Recommendation
    document.getElementById('recommendation-text').innerHTML = `<p>${data.technical.recommendation}</p>`;
    
    // Store analysis context for chat
    currentAnalysisContext = {
        pair: data.pair,
        technical: data.technical,
        fundamental: data.fundamental,
        alignment: data.alignment,
        timestamp: data.timestamp
    };
    
    chartResults.classList.remove('hidden');
    chartResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
    chartResults.classList.add('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

// Start the app
init();



// Chat functionality
let currentAnalysisContext = null;

function setupChatInterface() {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat-btn');
    
    sendBtn.addEventListener('click', sendChatMessage);
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
}

async function sendChatMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    
    if (!message || !currentAnalysisContext) return;
    
    // Add user message to chat
    addChatMessage(message, 'user');
    chatInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        const response = await fetch(`${API_BASE}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                context: currentAnalysisContext
            })
        });
        
        const data = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator();
        
        if (response.ok) {
            addChatMessage(data.response, 'ai');
        } else {
            addChatMessage('Sorry, I encountered an error. Please try again.', 'ai');
        }
    } catch (error) {
        console.error('Chat error:', error);
        removeTypingIndicator();
        addChatMessage('Sorry, I couldn\'t process your message. Please try again.', 'ai');
    }
}

function addChatMessage(text, sender) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    
    const avatar = sender === 'ai' ? '🤖' : '👤';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
            <p>${text}</p>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message ai-message typing-indicator-message';
    typingDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator-message');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Initialize chat when app starts
setupChatInterface();
