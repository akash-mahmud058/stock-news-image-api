# stock-news-image-api

A production-ready HTTP API that accepts stock news data as JSON and returns a **1080 × 1080 PNG social media card** — rendered by Puppeteer with a premium dark glassmorphism design.

---

## Features

- **POST /render** — accepts JSON, returns `image/png`
- **GET /** — health check endpoint
- Premium Bloomberg/TradingView-inspired dark card design
- Glassmorphism + blue gradient aesthetic
- Auto-wrapping headline and summary (no overflow, no clipping)
- Sentiment-coloured badges (Bullish = green, Bearish = red, Neutral = blue)
- Puppeteer + Chromium rendering at 2× device pixel ratio (300 DPI quality)
- Browser instance reused across requests for performance
- Docker + Render.com ready (free plan)

---

## Project Structure

```
stock-news-image-api/
├── index.js              # Express server
├── imageRenderer.js      # Puppeteer rendering engine
├── package.json
├── Dockerfile
├── render.yaml
├── .gitignore
├── README.md
├── templates/
│   └── news-card.html    # Card HTML template
├── public/
│   ├── style.css         # Card CSS (all tokens at top for easy editing)
│   └── logo.png          # Brand logo (replace with your own)
└── utils/
    └── helpers.js        # wrapText, truncateText, formatDate, sentimentColor
```

---

## Local Development

### Prerequisites

- Node.js 22+
- Google Chrome or Chromium installed locally (or use Docker)

### Install & run

```bash
git clone https://github.com/your-org/stock-news-image-api.git
cd stock-news-image-api
npm install
npm start
```

Server starts on **http://localhost:3000**.

For auto-reload during development:

```bash
npm run dev
```

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP port |
| `PUPPETEER_EXECUTABLE_PATH` | (bundled) | Path to Chrome/Chromium binary |
| `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` | — | Set `true` to skip download when using system Chromium |

---

## Docker

### Build

```bash
docker build -t stock-news-image-api .
```

### Run

```bash
docker run -p 3000:3000 stock-news-image-api
```

---

## Render.com Deployment

This project ships with a `render.yaml` blueprint.

### Steps

1. Push this repository to GitHub.
2. Log in to [Render.com](https://render.com).
3. Click **New → Blueprint** and connect your GitHub repository.
4. Render detects `render.yaml` and creates the service automatically.
5. Wait for the Docker build to complete (~3–5 minutes on first deploy).
6. Your API is live at `https://stock-news-image-api.onrender.com`.

> **Free plan note:** Render free web services spin down after inactivity. The first request after a cold start may take 20–30 seconds while the service boots.

---

## API Reference

### `GET /`

Health check.

**Response**

```json
{ "status": "running" }
```

---

### `POST /render`

Render a news card image.

**Request headers**

```
Content-Type: application/json
```

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `headline` | string | ✓ | Main news headline |
| `summary` | string | ✓ | 1–3 sentence summary |
| `company` | string | ✓ | Company name |
| `ticker` | string | ✓ | Stock ticker symbol |
| `category` | string | ✓ | e.g. Technology, Finance |
| `sentiment` | string | ✓ | `Bullish`, `Bearish`, or `Neutral` |
| `source` | string | ✓ | News source name |
| `published` | string | ✓ | ISO date `YYYY-MM-DD` |
| `brand` | string | ✓ | Your brand/app name |

**Response**

Binary `image/png` — 1080 × 1080 px at 2× DPR.

**Error responses**

| Status | Reason |
|---|---|
| `400` | Missing or empty required field |
| `500` | Internal rendering error |

---

## Testing the API

### cURL

```bash
curl -X POST http://localhost:3000/render \
  -H "Content-Type: application/json" \
  -d '{
    "headline": "NVIDIA Surges After Record Quarterly Earnings",
    "summary": "NVIDIA shares climbed after reporting stronger-than-expected revenue driven by AI chip demand.",
    "company": "NVIDIA",
    "ticker": "NVDA",
    "category": "Technology",
    "sentiment": "Bullish",
    "source": "Reuters",
    "published": "2026-06-28",
    "brand": "MarketPulse"
  }' \
  --output card.png
```

### HTTPie

```bash
http POST localhost:3000/render \
  headline="NVIDIA Surges After Record Quarterly Earnings" \
  summary="NVIDIA shares climbed after reporting stronger-than-expected revenue driven by AI chip demand." \
  company="NVIDIA" ticker="NVDA" category="Technology" \
  sentiment="Bullish" source="Reuters" published="2026-06-28" brand="MarketPulse" \
  > card.png
```

### JavaScript (fetch)

```js
const res = await fetch('http://localhost:3000/render', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    headline: 'NVIDIA Surges After Record Quarterly Earnings',
    summary: 'NVIDIA shares climbed after reporting stronger-than-expected revenue driven by AI chip demand.',
    company: 'NVIDIA',
    ticker: 'NVDA',
    category: 'Technology',
    sentiment: 'Bullish',
    source: 'Reuters',
    published: '2026-06-28',
    brand: 'MarketPulse',
  }),
});

const blob = await res.blob();
const url = URL.createObjectURL(blob);
// e.g. open in new tab: window.open(url)
```

---

## Customisation

### Design tokens

All visual variables are CSS custom properties at the top of `public/style.css`:

```css
:root {
  --bg-base:        #060b18;
  --gradient-start: #1d4ed8;
  --gradient-end:   #0ea5e9;
  --text-primary:   #f0f4ff;
  /* ... */
}
```

Change these to rebrand the card without touching any other CSS.

### Logo

Replace `public/logo.png` with your own 48 × 48 (or larger) PNG logo.

### Sentiment colours

Edit `utils/helpers.js` → `sentimentColor()` to change the green/red/blue values.

---

## License

MIT
