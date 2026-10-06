const rateLimit = require('express-rate-limit');

// Generous overall API limit — mainly to blunt scraping/abuse, not normal browsing.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again shortly.' },
});

// Checkout is intentionally stricter because guest orders are unauthenticated and
// can otherwise be abused to consume inventory or spam confirmation emails.
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many checkout attempts. Please wait a few minutes and try again.' },
});

// Tight limit on login/register/google — the actual brute-force target.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please wait a few minutes and try again.' },
});

module.exports = { apiLimiter, authLimiter, orderLimiter };
