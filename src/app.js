const express = require('express');
const crypto = require('crypto');

function createApp(store = new Map()) {
  const app = express();
  app.use(express.json());

  app.get('/healthz', (req, res) => res.json({ status: 'ok' }));

  app.post('/links', (req, res) => {
    const { url } = req.body || {};
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return res.status(400).json({ error: 'invalid url' });
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ error: 'invalid url' });
    }
    const code = crypto.randomBytes(4).toString('hex');
    store.set(code, parsed.href);
    return res.status(201).json({ code, url: parsed.href });
  });

  app.get('/:code', (req, res) => {
    const url = store.get(req.params.code);
    if (!url) return res.status(404).json({ error: 'not found' });
    return res.redirect(302, url);
  });

  return app;
}

module.exports = { createApp };