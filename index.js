const express = require('express');
const path = require('path');
const { renderNewsCard } = require('./imageRenderer');
const { validatePayload } = require('./utils/helpers');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'running' });
});

// Render news card
app.post('/render', async (req, res) => {
  try {
    const body = req.body;

    const validationError = validatePayload(body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const imageBuffer = await renderNewsCard(body);

    res.set({
      'Content-Type': 'image/png',
      'Content-Length': imageBuffer.length,
      'Cache-Control': 'no-cache',
      'Content-Disposition': 'attachment; filename="stock-news-card.png"' // <-- THIS IS THE NEW LINE
    });

    return res.send(imageBuffer);
  } catch (err) {
    console.error('Render error:', err);
    return res.status(500).json({ error: 'Internal server error during image rendering.' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

app.listen(PORT, () => {
  console.log(`stock-news-image-api running on port ${PORT}`);
});

module.exports = app;
