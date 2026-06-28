'use strict';

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { formatDate, sentimentColor, sentimentEmoji } = require('./utils/helpers');

let browserInstance = null;

async function getBrowser() {
  if (browserInstance) {
    try {
      // Ping the browser to verify it's still alive
      await browserInstance.version();
      return browserInstance;
    } catch {
      browserInstance = null;
    }
  }

  const launchOptions = {
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-sync',
      '--disable-translate',
      '--hide-scrollbars',
      '--metrics-recording-only',
      '--mute-audio',
      '--safebrowsing-disable-auto-update',
      '--font-render-hinting=none',
    ],
  };

  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  browserInstance = await puppeteer.launch(launchOptions);

  browserInstance.on('disconnected', () => {
    browserInstance = null;
  });

  return browserInstance;
}

/**
 * Render the news card and return a PNG Buffer.
 */
async function renderNewsCard(data) {
  const { headline, summary, company, ticker, category, sentiment, source, published, brand } = data;

  const cssPath = path.join(__dirname, 'public', 'style.css');
  const templatePath = path.join(__dirname, 'templates', 'news-card.html');

  const css = fs.readFileSync(cssPath, 'utf8');
  const template = fs.readFileSync(templatePath, 'utf8');

  // Optionally embed logo as base64
  const logoPath = path.join(__dirname, 'public', 'logo.png');
  let logoImg = '';
  if (fs.existsSync(logoPath)) {
    const logoBuffer = fs.readFileSync(logoPath);
    const logoBase64 = logoBuffer.toString('base64');
    logoImg = `<img class="brand-logo" src="data:image/png;base64,${logoBase64}" alt="${escapeHtml(brand)} logo" />`;
  }

  const color = sentimentColor(sentiment);
  const emoji = sentimentEmoji(sentiment);
  const formattedDate = formatDate(published);

  // Derive semi-transparent variants for sentiment badge
  const sentimentBg = hexToRgba(color, 0.15);
  const sentimentBorder = hexToRgba(color, 0.40);

  const html = template
    .replace('{{CSS}}', css)
    .replace('{{BRAND}}', escapeHtml(brand))
    .replace('{{LOGO_IMG}}', logoImg)
    .replace('{{CATEGORY}}', escapeHtml(category))
    .replace('{{HEADLINE}}', escapeHtml(headline))
    .replace('{{SUMMARY}}', escapeHtml(summary))
    .replace('{{COMPANY}}', escapeHtml(company))
    .replace('{{TICKER}}', escapeHtml(ticker.toUpperCase()))
    .replace('{{SENTIMENT}}', escapeHtml(sentiment))
    .replace('{{SENTIMENT_EMOJI}}', emoji)
    .replace('{{SENTIMENT_COLOR}}', color)
    .replace('{{SENTIMENT_BG}}', sentimentBg)
    .replace('{{SENTIMENT_BORDER}}', sentimentBorder)
    .replace('{{SOURCE}}', escapeHtml(source))
    .replace('{{DATE}}', formattedDate);

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setViewport({
      width: 1080,
      height: 1080,
      deviceScaleFactor: 2, // High DPI — 300 DPI quality equivalent
    });

    await page.setContent(html, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
    });

    // Wait for all web fonts to finish loading
    await page.evaluate(() => document.fonts.ready);

    // Small settle buffer
    await new Promise((r) => setTimeout(r, 200));

    const cardEl = await page.$('#card');
    if (!cardEl) {
      throw new Error('Card element (#card) not found in rendered HTML.');
    }

    const screenshot = await cardEl.screenshot({
      type: 'png',
      omitBackground: false,
    });

    return screenshot;
  } finally {
    await page.close();
  }
}

// ── Utilities ────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Convert a hex color string (#rrggbb) to rgba(r,g,b,a).
 */
function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

module.exports = { renderNewsCard };
