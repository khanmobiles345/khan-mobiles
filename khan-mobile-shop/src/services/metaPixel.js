// Meta Pixel is intentionally kept installed in index.html, but all Meta
// ecommerce/event tracking functions have been removed to prevent duplicate events.
// TikTok tracking remains active.

const isTikTokReady = () =>
  typeof window !== 'undefined' &&
  window.ttq &&
  typeof window.ttq.track === 'function';

const oncePerSession = (key, callback) => {
  try {
    const storageKey = 'khan-ttq-' + key;
    if (window.sessionStorage.getItem(storageKey)) return;
    window.sessionStorage.setItem(storageKey, '1');
    callback();
  } catch {
    callback();
  }
};

export const trackTikTokViewContent = (product) => {
  if (!isTikTokReady() || !product) return;
  oncePerSession(`tt-view-${String(product.id)}`, () => {
    window.ttq.track('ViewContent', {
      contents: [{ content_id: String(product.id), content_name: product.name, content_type: 'product', quantity: 1, price: Number(product.price) }],
      content_type: 'product', value: Number(product.price), currency: 'PKR',
    });
  });
};

export const trackTikTokAddToCart = (product, quantity = 1) => {
  if (!isTikTokReady() || !product) return;
  window.ttq.track('AddToCart', {
    contents: [{ content_id: String(product.id), content_name: product.name, content_type: 'product', quantity: Number(quantity), price: Number(product.price) }],
    content_type: 'product', value: Number(product.price) * Number(quantity), currency: 'PKR',
  });
};

export const trackTikTokInitiateCheckout = (items, total) => {
  if (!isTikTokReady() || !items?.length) return;
  window.ttq.track('InitiateCheckout', {
    contents: items.map((item) => ({ content_id: String(item.id || item.productId), content_name: item.name, content_type: 'product', quantity: Number(item.quantity), price: Number(item.price) })),
    value: Number(total), currency: 'PKR',
  });
};

export const trackTikTokPurchase = (order) => {
  if (!isTikTokReady() || !order) return;
  const key = `tt-purchase-${order.orderId || order.orderNumber}`;
  oncePerSession(key, () => {
    window.ttq.track('Purchase', {
      contents: (order.items || []).map((item) => ({ content_id: String(item.productId || item.id), content_name: item.name, content_type: 'product', quantity: Number(item.quantity), price: Number(item.price) })),
      value: Number(order.total), currency: 'PKR',
    });
  });
};
