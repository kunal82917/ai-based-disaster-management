/**
 * HazardWatch – Lightweight API Server
 * Handles incidents storage via MongoDB (Mongoose)
 * Run:  node server-simple.js   (from the /backend directory)
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');
const path     = require('path');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'] }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve the frontend static files
app.use(express.static(path.join(__dirname, '../public')));

// ── Routes ─────────────────────────────────────
const incidentsRouter = require('./routes/incidents');
app.use('/api/incidents', incidentsRouter);

// News proxy (keeps API key server-side for Vercel; optional for local dev)
app.get('/api/news', async (req, res) => {
  try {
    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'GNEWS_API_KEY not set' });

    const url = `https://gnews.io/api/v4/search?q=flood+OR+cyclone+OR+earthquake+OR+disaster&lang=en&country=in&max=10&sortby=publishedAt&token=${apiKey}`;
    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Fallback: serve index.html for any unknown path
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ── MongoDB connection ──────────────────────────
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not set in .env — cannot start server.');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 })
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 HazardWatch API running on http://localhost:${PORT}`);
      console.log(`   Frontend:  http://localhost:${PORT}/dashboard.html`);
      console.log(`   Incidents: http://localhost:${PORT}/api/incidents`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
