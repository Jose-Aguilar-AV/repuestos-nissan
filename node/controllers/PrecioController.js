// node/controllers/PrecioController.js
const axios = require('axios');

const ALPHA_KEY = process.env.ALPHA_VANTAGE_API_KEY;
let ALPACA_BASE = process.env.ALPACA_BASE_URL || 'https://data.alpaca.markets';
// if user provided broker base, use the market data base
if (ALPACA_BASE.includes('broker-api')) {
  ALPACA_BASE = 'https://data.alpaca.markets';
}

const ALPACA_HEADERS = {
  'APCA-API-KEY-ID': process.env.ALPACA_API_KEY,
  'APCA-API-SECRET-KEY': process.env.ALPACA_SECRET_KEY,
};

async function getFromAlphaVantage(symbol) {
  const url = `https://www.alphavantage.co/query`;
  const params = {
    function: 'GLOBAL_QUOTE',
    symbol,
    apikey: ALPHA_KEY,
  };
  const resp = await axios.get(url, { params, timeout: 10000 });
  // Alpha Vantage returns object under "Global Quote"
  const data = resp.data && resp.data['Global Quote'] ? resp.data['Global Quote'] : null;
  if (!data) throw new Error('No data from AlphaVantage or rate-limited');
  return {
    source: 'alphavantage',
    symbol,
    price: parseFloat(data['05. price'] || data['05. Price'] || NaN),
    raw: data,
  };
}

async function getFromAlpaca(symbol) {
  // Latest quote endpoint for equities
  const url = `${ALPACA_BASE}/v2/stocks/${encodeURIComponent(symbol)}/quotes/latest`;
  const resp = await axios.get(url, { headers: ALPACA_HEADERS, timeout: 10000 });
  // response format: check that resp.data has quote fields; normalize
  const q = resp.data && (resp.data.quote || resp.data);
  // Alpaca returns object with 'quote' (or direct); adapt defensively
  let price = NaN;
  if (q && q.last && q.last.price) price = q.last.price;
  // fallback: if no last, try bid/ask midpoint
  if (isNaN(price) && q && q.bid && q.ask && q.bid.price && q.ask.price) {
    price = (q.bid.price + q.ask.price) / 2;
  }
  return {
    source: 'alpaca',
    symbol,
    price,
    raw: q,
  };
}

exports.getQuote = async (req, res) => {
  const { symbol } = req.params;
  const source = (req.query.source || 'alpha').toLowerCase(); // alpha | alpaca
  if (!symbol) return res.status(400).json({ error: 'Symbol required' });
  try {
    let result;
    if (source === 'alpaca') {
      result = await getFromAlpaca(symbol);
    } else {
      result = await getFromAlphaVantage(symbol);
    }
    return res.json({ ok: true, result });
  } catch (err) {
    console.error('getQuote error', err.message || err);
    return res.status(500).json({ ok: false, error: err.message || 'Failed to fetch price' });
  }
};

exports.getBatch = async (req, res) => {
  // /api/precios/batch?symbols=AAPL,MSFT&source=alpha
  const raw = req.query.symbols;
  const source = (req.query.source || 'alpha').toLowerCase();
  if (!raw) return res.status(400).json({ error: 'symbols query param required (comma separated)' });
  const symbols = raw.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
  try {
    // Warning: Alpha Vantage has strict limits; use with care
    const calls = symbols.map(sym => {
      if (source === 'alpaca') return getFromAlpaca(sym);
      return getFromAlphaVantage(sym);
    });
    const results = await Promise.allSettled(calls);
    const formatted = results.map((r, i) => {
      if (r.status === 'fulfilled') return { symbol: symbols[i], ok: true, data: r.value };
      return { symbol: symbols[i], ok: false, error: r.reason ? r.reason.message : 'error' };
    });
    return res.json({ ok: true, results: formatted });
  } catch (err) {
    console.error('getBatch error', err);
    return res.status(500).json({ ok: false, error: err.message || 'Failed batch' });
  }
};
