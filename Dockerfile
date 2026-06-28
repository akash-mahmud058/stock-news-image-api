# ─────────────────────────────────────────────────────────────────────────────
# stock-news-image-api  ·  Dockerfile
# Node 22 + Chromium (for Puppeteer) on Debian Bookworm Slim
# ─────────────────────────────────────────────────────────────────────────────

FROM node:22-bookworm-slim

# ── System dependencies for Chromium / Puppeteer ─────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
      chromium \
      chromium-sandbox \
      fonts-liberation \
      fonts-noto-color-emoji \
      fonts-freefont-ttf \
      libnss3 \
      libatk-bridge2.0-0 \
      libcups2 \
      libxcomposite1 \
      libxdamage1 \
      libxfixes3 \
      libxrandr2 \
      libgbm1 \
      libxkbcommon0 \
      libpango-1.0-0 \
      libcairo2 \
      libasound2 \
      ca-certificates \
      wget \
    && rm -rf /var/lib/apt/lists/*

# ── Tell Puppeteer to use the system Chromium, not download its own ───────────
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=production \
    PORT=3000

# ── Working directory ─────────────────────────────────────────────────────────
WORKDIR /app

# ── Install Node dependencies (requires package-lock.json) ───────────────────
COPY package*.json ./
RUN PUPPETEER_SKIP_DOWNLOAD=true npm ci --omit=dev

# ── Copy application source ───────────────────────────────────────────────────
COPY . .

# ── Expose port ───────────────────────────────────────────────────────────────
EXPOSE 3000

# ── Start server ──────────────────────────────────────────────────────────────
CMD ["node", "index.js"]
