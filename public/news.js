// ========================================
// News Page JavaScript
// ========================================

// Firebase Config
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCFYKtb_fNUtLA3Yz0Ssx4PoBoKQIQxOM0",
    authDomain: "disaster-ai-240b7.firebaseapp.com",
    projectId: "disaster-ai-240b7"
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Get DOM element by ID
 */
function getElement(id) {
    return document.getElementById(id);
}

/**
 * Format time for display
 */
function formatTime(dateString) {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString();
    } catch (e) {
        return 'Recently';
    }
}

/**
 * Get badge type from title
 */
function getBadgeType(title) {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('breaking') || lowerTitle.includes('urgent') || lowerTitle.includes('emergency')) {
        return 'breaking';
    }
    if (lowerTitle.includes('alert') || lowerTitle.includes('warning')) {
        return 'alert';
    }
    return 'update';
}

// ========================================
// NEWS LOADING & RENDERING
// ========================================

// GNews API configuration
const GNEWS_API_KEY = 'fdfb9e5b394271a3b276d5b9c8d0f00e';
const GNEWS_API_URL = 'https://gnews.io/api/v4/search';

/**
 * Load and display India-specific disaster news from GNews API
 */
async function loadNews() {
    const newsContainer = getElement('newsArticles');
    if (!newsContainer) return;

    newsContainer.innerHTML = '<div class="loading">Loading latest India disaster news...</div>';

    // Try cache first (30 min TTL)
    const cachedNews = getFromCache('news');
    if (cachedNews && cachedNews.articles && cachedNews.articles.length > 0) {
        console.log('✅ Using cached GNews articles');
        renderNewsArticles(cachedNews.articles);
        return;
    }

    try {
        // Build GNews direct URL (CORS supported)
        const params = new URLSearchParams({
            q: 'flood OR cyclone OR earthquake OR landslide OR disaster OR storm OR heatwave',
            lang: 'en',
            country: 'in',
            max: '10',
            sortby: 'publishedAt',
            token: GNEWS_API_KEY
        });

        const response = await fetch(`${GNEWS_API_URL}?${params.toString()}`, {
            signal: AbortSignal.timeout(8000)
        });

        if (!response.ok) {
            throw new Error(`GNews API error: HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.articles && data.articles.length > 0) {
            console.log(`✅ [GNews] Loaded ${data.articles.length} India news articles`);
            saveToCache('news', { articles: data.articles, timestamp: Date.now() });
            renderNewsArticles(data.articles);
        } else {
            console.warn('⚠️ [GNews] No articles returned, using sample news');
            loadSampleNews();
        }
    } catch (error) {
        console.warn('⚠️ [GNews] Fetch failed:', error.message);
        loadSampleNews();
    }
}

/**
 * Render news articles
 */
function renderNewsArticles(articles) {
    const newsContainer = getElement('newsArticles');
    if (!newsContainer) return;

    const fragment = document.createDocumentFragment();
    newsContainer.innerHTML = '';

    articles.forEach((article, index) => {
        const badge = getBadgeType(article.title || '');
        const articleElement = createNewsArticleElement(article, badge, index);
        fragment.appendChild(articleElement);
    });

    newsContainer.appendChild(fragment);
}

/**
 * Create news article element
 */
function createNewsArticleElement(article, badge, index) {
    const articleDiv = document.createElement('article');
    articleDiv.className = 'news-article';
    articleDiv.style.animationDelay = `${index * 0.1}s`;

    const imageUrl = article.image || 'https://via.placeholder.com/400x250/457B9D/FFFFFF?text=News';
    const publishedAt = article.publishedAt ? formatTime(article.publishedAt) : 'Recently';
    const source = article.source ? article.source.name : 'News Source';

    articleDiv.innerHTML = `
        <div class="article-image">
            <img src="${imageUrl}" alt="${article.title}" onerror="this.src='https://via.placeholder.com/400x250/457B9D/FFFFFF?text=News'">
            <div class="article-badge badge-${badge}">${badge.toUpperCase()}</div>
        </div>
        <div class="article-content">
            <h3 class="article-title">${article.title}</h3>
            <p class="article-description">${article.description || 'No description available.'}</p>
            <div class="article-meta">
                <span class="article-source">${source}</span>
                <span class="article-time">${publishedAt}</span>
            </div>
            <a href="${article.url}" target="_blank" class="btn-read-more">
                Read Full Article
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M7 17L17 7"/>
                    <path d="M7 7h10v10"/>
                </svg>
            </a>
        </div>
    `;

    return articleDiv;
}

/**
 * Load sample news when API fails
 */
function loadSampleNews() {
    const sampleArticles = [
        {
            title: 'Heavy rainfall triggers flash floods in coastal districts - Urgent evacuation underway',
            description: 'Authorities have issued emergency evacuation orders for residents in low-lying areas as heavy monsoon rains continue to cause widespread flooding. Over 10,000 people have been affected.',
            publishedAt: new Date(Date.now() - 15 * 60000).toISOString(),
            source: { name: 'National Disaster Management' },
            url: '#',
            image: 'https://via.placeholder.com/400x250/E63946/FFFFFF?text=Flood+Alert'
        },
        {
            title: 'Strong earthquake tremors felt across multiple states - No casualties reported yet',
            description: 'A magnitude 6.2 earthquake struck early this morning, causing tremors that were felt in several neighboring states. Assessment teams are currently evaluating damage.',
            publishedAt: new Date(Date.now() - 45 * 60000).toISOString(),
            source: { name: 'Geological Survey' },
            url: '#',
            image: 'https://via.placeholder.com/400x250/457B9D/FFFFFF?text=Earthquake'
        },
        {
            title: 'Severe weather alert issued for tomorrow - Heavy wind and rain expected',
            description: 'The meteorological department has issued a severe weather warning for tomorrow, predicting heavy rainfall and strong winds across the region.',
            publishedAt: new Date(Date.now() - 90 * 60000).toISOString(),
            source: { name: 'Weather Department' },
            url: '#',
            image: 'https://via.placeholder.com/400x250/06D6A0/FFFFFF?text=Weather+Alert'
        },
        {
            title: 'Rescue operations continue in flood-affected areas - Over 500 people evacuated',
            description: 'Rescue teams have successfully evacuated over 500 people from flood-affected areas. Relief camps have been established and essential supplies are being distributed.',
            publishedAt: new Date(Date.now() - 2.5 * 3600000).toISOString(),
            source: { name: 'Emergency Response Team' },
            url: '#',
            image: 'https://via.placeholder.com/400x250/F77F00/FFFFFF?text=Rescue+Ops'
        },
        {
            title: 'Government opens 25 relief centers in disaster zones - Medical aid being provided',
            description: 'The government has established 25 relief centers across the affected districts, providing food, water, and medical assistance to those impacted by the recent disasters.',
            publishedAt: new Date(Date.now() - 3.5 * 3600000).toISOString(),
            source: { name: 'Government Relief Services' },
            url: '#',
            image: 'https://via.placeholder.com/400x250/457B9D/FFFFFF?text=Relief+Centers'
        },
        {
            title: 'Landslide risk warning for hilly regions - Residents advised to stay alert',
            description: 'Due to continuous rainfall, there is a high risk of landslides in hilly areas. Residents are advised to avoid travel and stay in safe locations.',
            publishedAt: new Date(Date.now() - 4.5 * 3600000).toISOString(),
            source: { name: 'Landslide Monitoring Center' },
            url: '#',
            image: 'https://via.placeholder.com/400x250/E63946/FFFFFF?text=Landslide+Warning'
        }
    ];

    renderNewsArticles(sampleArticles);
}

// ========================================
// CACHE MANAGEMENT (30-minute TTL)
// ========================================

/**
 * Get data from cache
 */
function getFromCache(key) {
    try {
        const cached = localStorage.getItem(`gnews_${key}`);
        if (cached) {
            const parsed = JSON.parse(cached);
            const now = Date.now();
            const maxAge = 30 * 60 * 1000; // 30 minutes
            if (parsed.timestamp && (now - parsed.timestamp) < maxAge) {
                return parsed.data;
            }
        }
    } catch (e) {
        console.warn('Cache read error:', e);
    }
    return null;
}

/**
 * Save data to cache
 */
function saveToCache(key, data) {
    try {
        localStorage.setItem(`gnews_${key}`, JSON.stringify({
            data: data,
            timestamp: Date.now()
        }));
    } catch (e) {
        console.warn('Cache write error:', e);
    }
}

// ========================================
// FILTERING
// ========================================

/**
 * Setup news filters
 */
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const filter = button.dataset.filter;
            filterNews(filter);
        });
    });
}

/**
 * Filter news articles
 */
function filterNews(filterType) {
    const articles = document.querySelectorAll('.news-article');

    articles.forEach(article => {
        const badge = article.querySelector('.article-badge');
        if (!badge) return;

        const badgeText = badge.textContent.toLowerCase();

        if (filterType === 'all') {
            article.style.display = 'block';
        } else if (badgeText.includes(filterType)) {
            article.style.display = 'block';
        } else {
            article.style.display = 'none';
        }
    });
}

// ========================================
// INITIALIZATION
// ========================================

/**
 * Initialize the news page
 */
function init() {
    // Load news
    loadNews();

    // Setup filters
    setupFilters();

    // Update last updated time
    const lastUpdated = getElement('lastUpdated');
    if (lastUpdated) {
        lastUpdated.textContent = formatTime(new Date());
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);