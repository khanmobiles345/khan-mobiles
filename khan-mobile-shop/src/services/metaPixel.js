/**
 * Central Meta Pixel Event Manager
 *
 * Meta Pixel is initialized once in index.html.
 * This module is the ONLY place where application code should call fbq().
 *
 * Safety rules:
 * - Only events explicitly added to ENABLED_META_EVENTS can fire.
 * - Every event gets a stable eventId.
 * - The same dedupeKey cannot fire twice during the current page session.
 * - Tracking failures are swallowed so analytics can never break the shop UI.
 *
 * Do not call window.fbq directly from components/pages.
 */

const META_PIXEL_ID = '819668267751439';

// Only ViewContent is enabled for now.
const ENABLED_META_EVENTS = new Set(['ViewContent']);

const DEDUPE_TTL_MS = 5000;
const sentEvents = new Map();

const isMetaReady = () =>
  typeof window !== 'undefined' &&
  typeof window.fbq === 'function';

const makeEventId = (eventName, dedupeKey) => {
  if (dedupeKey) return `khan-${eventName}-${String(dedupeKey)}`;

  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `khan-${eventName}-${crypto.randomUUID()}`;
    }
  } catch {
    // Fall through to the timestamp/random fallback.
  }

  return `khan-${eventName}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const cleanupDedupeCache = (now) => {
  for (const [key, timestamp] of sentEvents) {
    if (now - timestamp > DEDUPE_TTL_MS) sentEvents.delete(key);
  }
};

export const trackMetaEvent = (eventName, parameters = {}, options = {}) => {
  try {
    if (!ENABLED_META_EVENTS.has(eventName)) return false;
    if (!isMetaReady()) return false;

    const now = Date.now();
    cleanupDedupeCache(now);

    const dedupeKey = options.dedupeKey
      ? `${eventName}:${String(options.dedupeKey)}`
      : null;

    if (dedupeKey && sentEvents.has(dedupeKey)) return false;
    if (dedupeKey) sentEvents.set(dedupeKey, now);

    const eventId = makeEventId(eventName, options.dedupeKey);
    window.fbq('track', eventName, parameters, { eventID: eventId });

    return true;
  } catch {
    return false;
  }
};

export const trackMetaViewContent = (product) => {
  if (!product) return false;

  return trackMetaEvent(
    'ViewContent',
    {
      content_ids: [String(product.id)],
      content_name: product.name,
      content_type: 'product',
      value: Number(product.price),
      currency: 'PKR',
    },
    { dedupeKey: `product-${product.id}` },
  );
};

// Other Meta events remain available for later, but are disabled until
// explicitly added to ENABLED_META_EVENTS.
export const trackMetaAddToCart = (product, quantity = 1, actionId) => {
  if (!product) return false;

  const qty = Math.max(1, Number(quantity) || 1);
  return trackMetaEvent(
    'AddToCart',
    {
      content_ids: [String(product.id)],
      content_name: product.name,
      content_type: 'product',
      value: Number(product.price) * qty,
      currency: 'PKR',
      contents: [{
        id: String(product.id),
        quantity: qty,
        item_price: Number(product.price),
      }],
    },
    { dedupeKey: actionId || `product-${product.id}-${Date.now()}` },
  );
};

export const trackMetaInitiateCheckout = (items, total, checkoutId) => {
  if (!Array.isArray(items) || items.length === 0) return false;

  return trackMetaEvent(
    'InitiateCheckout',
    {
      content_ids: items.map((item) => String(item.id || item.productId)),
      contents: items.map((item) => ({
        id: String(item.id || item.productId),
        quantity: Math.max(1, Number(item.quantity) || 1),
        item_price: Number(item.price),
      })),
      content_type: 'product',
      value: Number(total),
      currency: 'PKR',
      num_items: items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
    },
    { dedupeKey: checkoutId || `checkout-${Date.now()}` },
  );
};

export const trackMetaPurchase = (order) => {
  if (!order) return false;

  const orderId = order.orderId || order.orderNumber;
  if (!orderId) return false;

  return trackMetaEvent(
    'Purchase',
    {
      content_ids: (order.items || []).map((item) => String(item.productId || item.id)),
      contents: (order.items || []).map((item) => ({
        id: String(item.productId || item.id),
        quantity: Math.max(1, Number(item.quantity) || 1),
        item_price: Number(item.price),
      })),
      content_type: 'product',
      value: Number(order.total),
      currency: 'PKR',
    },
    { dedupeKey: `order-${orderId}` },
  );
};

export const getMetaPixelConfig = () => ({
  pixelId: META_PIXEL_ID,
  enabledEvents: [...ENABLED_META_EVENTS],
});
