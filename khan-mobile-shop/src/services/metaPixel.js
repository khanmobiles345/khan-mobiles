const META_PIXEL_ID = '819668267751439';

const isReady = () => typeof window !== 'undefined' && typeof window.fbq === 'function';
const isTikTokReady = () => typeof window !== 'undefined' && window.ttq && typeof window.ttq.track === 'function';
const isBrowser = () => typeof window !== 'undefined';

const oncePerSession = (key, callback) => {
  if (!isBrowser() || typeof window.sessionStorage === 'undefined') return callback();
  const storageKey = `khan-mobile-track-${key}`;
  if (sessionStorage.getItem(storageKey)) return;
  try {
    sessionStorage.setItem(storageKey, '1');
  } catch {
    // If storage is blocked, still allow the event to be sent.
  }
  callback();
};

export const trackViewContent = (product) => {
  if (!isReady() || !product) return;
  oncePerSession(`view-${String(product.id)}`, () => {
    window.fbq('track', 'ViewContent', {
      content_ids: [String(product.id)],
      content_name: product.name,
      content_type: 'product',
      value: Number(product.price),
      currency: 'PKR',
    });
  });
};

export const trackAddToCart = (product, quantity = 1) => {
  if (!isReady() || !product) return;
  window.fbq('track', 'AddToCart', {
    content_ids: [String(product.id)],
    content_name: product.name,
    content_type: 'product',
    value: Number(product.price) * Number(quantity),
    currency: 'PKR',
    contents: [{ id: String(product.id), quantity: Number(quantity), item_price: Number(product.price) }],
  });
};

export const trackInitiateCheckout = (items, total) => {
  if (!isReady() || !items?.length) return;
  window.fbq('track', 'InitiateCheckout', {
    content_ids: items.map((item) => String(item.id || item.productId)),
    contents: items.map((item) => ({ id: String(item.id || item.productId), quantity: Number(item.quantity), item_price: Number(item.price) })),
    content_type: 'product',
    num_items: items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    value: Number(total),
    currency: 'PKR',
  });
};

export const trackPurchase = (order) => {
  if (!isReady() || !order) return;

  const orderKey = order.orderId || order.orderNumber;
  if (!orderKey) return;

  // Meta requires Purchase.value to be a real positive number and
  // Purchase.currency to be a valid ISO 4217 currency code.
  // The API returns total as a number, but normalize it defensively so
  // formatted strings or invalid values can never be sent to Meta.
  const purchaseValue = Number(order.total);
  if (!Number.isFinite(purchaseValue) || purchaseValue <= 0) {
    console.warn('[Meta Pixel] Purchase skipped: invalid order total', order.total);
    return;
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const contentIds = items
    .map((item) => item.productId || item.id)
    .filter(Boolean)
    .map((id) => String(id));

  const contents = items
    .filter((item) => item.productId || item.id)
    .map((item) => {
      const quantity = Number(item.quantity);
      const itemPrice = Number(item.price);
      return {
        id: String(item.productId || item.id),
        quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
        item_price: Number.isFinite(itemPrice) && itemPrice >= 0 ? itemPrice : 0,
      };
    });

  oncePerSession(`purchase-${String(orderKey)}`, () => {
    const purchaseParams = {
      value: purchaseValue,
      currency: 'PKR',
      content_type: 'product',
      content_ids: contentIds,
      contents,
      num_items: contents.reduce((sum, item) => sum + item.quantity, 0),
    };

    // Keep value and currency at the top level of the Purchase event.
    // These are the parameters Meta uses for purchase value reporting.
    window.fbq('track', 'Purchase', purchaseParams);
  });
};

export const trackTikTokViewContent = (product) => {
  if (!isTikTokReady() || !product) return;
  oncePerSession(`tt-view-${String(product.id)}`, () => {
    window.ttq.track('ViewContent', {
      contents: [{
        content_id: String(product.id),
        content_name: product.name,
        content_type: 'product',
        quantity: 1,
        price: Number(product.price),
      }],
      content_type: 'product',
      value: Number(product.price),
      currency: 'PKR',
    });
  });
};

export const trackTikTokAddToCart = (product, quantity = 1) => {
  if (!isTikTokReady() || !product) return;
  window.ttq.track('AddToCart', {
    contents: [{
      content_id: String(product.id),
      content_name: product.name,
      content_type: 'product',
      quantity: Number(quantity),
      price: Number(product.price),
    }],
    content_type: 'product',
    value: Number(product.price) * Number(quantity),
    currency: 'PKR',
  });
};

export const trackTikTokInitiateCheckout = (items, total) => {
  if (!isTikTokReady() || !items?.length) return;
  window.ttq.track('InitiateCheckout', {
    contents: items.map((item) => ({
      content_id: String(item.id || item.productId),
      content_name: item.name,
      content_type: 'product',
      quantity: Number(item.quantity),
      price: Number(item.price),
    })),
    value: Number(total),
    currency: 'PKR',
  });
};

export const trackTikTokPurchase = (order) => {
  if (!isTikTokReady() || !order) return;
  const key = `tt-purchase-${order.orderId || order.orderNumber}`;
  oncePerSession(key, () => {
    window.ttq.track('Purchase', {
      contents: (order.items || []).map((item) => ({
        content_id: String(item.productId || item.id),
        content_name: item.name,
        content_type: 'product',
        quantity: Number(item.quantity),
        price: Number(item.price),
      })),
      value: Number(order.total),
      currency: 'PKR',
    });
  });
};

export { META_PIXEL_ID };
