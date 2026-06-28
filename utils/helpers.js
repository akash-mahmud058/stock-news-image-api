'use strict';

const REQUIRED_FIELDS = [
  'headline',
  'summary',
  'company',
  'ticker',
  'category',
  'sentiment',
  'source',
  'published',
  'brand',
];

const VALID_SENTIMENTS = ['Bullish', 'Bearish', 'Neutral'];

/**
 * Validate incoming POST /render payload.
 * Returns an error string or null if valid.
 */
function validatePayload(body) {
  if (!body || typeof body !== 'object') {
    return 'Request body must be a JSON object.';
  }

  for (const field of REQUIRED_FIELDS) {
    if (!body[field] || String(body[field]).trim() === '') {
      return `Missing or empty required field: "${field}".`;
    }
  }

  return null;
}

/**
 * Wrap text to a given character width.
 * Returns an array of lines.
 */
function wrapText(text, maxCharsPerLine = 50) {
  if (!text) return [];
  const words = String(text).split(/\s+/);
  const lines = [];
  let current = '';

  for (const word of words) {
    if ((current + (current ? ' ' : '') + word).length <= maxCharsPerLine) {
      current += (current ? ' ' : '') + word;
    } else {
      if (current) lines.push(current);
      // If a single word exceeds line width, split it hard
      if (word.length > maxCharsPerLine) {
        let remaining = word;
        while (remaining.length > maxCharsPerLine) {
          lines.push(remaining.slice(0, maxCharsPerLine));
          remaining = remaining.slice(maxCharsPerLine);
        }
        current = remaining;
      } else {
        current = word;
      }
    }
  }

  if (current) lines.push(current);
  return lines;
}

/**
 * Truncate text to a max length, appending ellipsis if needed.
 */
function truncateText(text, maxLength = 200) {
  if (!text) return '';
  const str = String(text);
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3).trimEnd() + '…';
}

/**
 * Format an ISO date string (YYYY-MM-DD) into a human-readable form.
 * e.g. "2026-06-28" → "Jun 28, 2026"
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    // Parse as UTC to avoid timezone shifts
    const [year, month, day] = String(dateStr).split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return String(dateStr);
  }
}

/**
 * Return a CSS hex color for a sentiment value.
 */
function sentimentColor(sentiment) {
  const s = String(sentiment).toLowerCase();
  if (s === 'bullish') return '#22c55e';   // green-500
  if (s === 'bearish') return '#ef4444';   // red-500
  return '#3b82f6';                         // blue-500 (neutral)
}

/**
 * Return a small emoji indicator for a sentiment value.
 */
function sentimentEmoji(sentiment) {
  const s = String(sentiment).toLowerCase();
  if (s === 'bullish') return '▲';
  if (s === 'bearish') return '▼';
  return '●';
}

module.exports = {
  validatePayload,
  wrapText,
  truncateText,
  formatDate,
  sentimentColor,
  sentimentEmoji,
};
