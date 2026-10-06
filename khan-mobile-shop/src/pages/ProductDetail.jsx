import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import Footer from '../components/Footer';
import Container from '../components/Container';
import Button from '../components/Button';
import Badge from '../components/Badge';
import ProductCard from '../components/ProductCard';
import { trackTikTokViewContent, trackTikTokAddToCart, trackMetaViewContent, trackMetaAddToCart } from '../services/metaPixel';
import { trackGA4ViewItem, trackGA4AddToCart } from '../services/analytics';

const badgeVariantMap = { New: 'accent', Hot: 'warning', Sale: 'warning', Bestseller: 'success' };

const CURATED_PRODUCT_SEO = {
  '65w-gan-fast-charger': {
    title: '65W GaN Fast Charger by PowerMax for Samsung, iPhone & More',
    description: 'Shop the PowerMax 65W GaN Fast Charger for Samsung S23/S22, iPhone 15, Redmi Note 12 and OnePlus 11. Rs. 2,499 with Cash on Delivery across Pakistan.',
    imageAlt: 'PowerMax 65W GaN Fast Charger for Samsung, iPhone, Redmi and OnePlus',
  },
};

const StarRating = ({ rating, size = 16 }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <svg key={s} width={size} height={size} viewBox="0 0 24 24"
        fill={s <= Math.round(rating) ? '#f59e0b' : '#E2E8F0'} stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

const ReviewsSection = ({ productId, rating, reviewCount }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/reviews/product/${productId}`)
      .then((data) => setReviews(Array.isArray(data?.reviews) ? data.reviews : []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [productId]);

  const safeRating = Number(rating) || 0;
  const safeReviewCount = Number(reviewCount) || 0;

  return (
    <section className="pb-20 border-t border-navy-700 pt-12">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-2xl font-extrabold">Customer Reviews</h2>
        {safeReviewCount > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={safeRating} size={18} />
            <span className="text-sm text-slate-500">{safeRating.toFixed(1)} · {safeReviewCount} review{safeReviewCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <div className="bg-navy-800 rounded-xl2 p-8 text-center">
          <span className="text-4xl block mb-3">⭐</span>
          <p className="text-slate-900 font-semibold mb-1">No reviews yet</p>
          <p className="text-slate-500 text-sm">Be the first to review this product after your order is delivered.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-navy-800 rounded-xl2 p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/15 text-accent text-sm font-bold flex items-center justify-center">
                    {r.userName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{r.userName}</span>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(r.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <StarRating rating={r.rating} size={14} />
              {r.comment && <p className="text-sm text-slate-600 mt-2 leading-relaxed">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const loadProduct = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const data = await api.get(`/api/products/${id}`);
      const productData = data?.product || data;
      if (!productData || typeof productData !== 'object' || !productData.id) {
        throw new Error('Invalid product response');
      }

      const normalizedProduct = {
        ...productData,
        name: String(productData.name || 'Product'),
        price: Number.isFinite(Number(productData.price)) ? Number(productData.price) : 0,
        compareAtPrice: productData.compareAtPrice == null ? null : Number(productData.compareAtPrice),
        category: String(productData.category || ''),
        brand: String(productData.brand || ''),
        rating: Number.isFinite(Number(productData.rating)) ? Number(productData.rating) : 0,
        reviewCount: Number.isFinite(Number(productData.reviewCount)) ? Number(productData.reviewCount) : 0,
        stock: Number.isFinite(Number(productData.stock)) ? Number(productData.stock) : 0,
        images: Array.isArray(productData.images) ? productData.images.filter((img) => img?.url) : [],
        compatibleModels: Array.isArray(productData.compatibleModels) ? productData.compatibleModels : [],
      };

      setProduct(normalizedProduct);
      setActiveImageIndex(0);

      if (normalizedProduct.category) {
        try {
          const relatedData = await api.get(`/api/products?category=${encodeURIComponent(normalizedProduct.category)}&limit=5`);
          const relatedProducts = Array.isArray(relatedData?.products) ? relatedData.products : [];
          setRelated(relatedProducts.filter((p) => p.id !== normalizedProduct.id).slice(0, 4));
        } catch {
          setRelated([]);
        }
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadProduct(); window.scrollTo(0, 0); }, [loadProduct]);

  useEffect(() => {
    if (!product) return;
    try { trackTikTokViewContent(product); } catch { /* tracking must never break rendering */ }
    try { trackMetaViewContent(product); } catch { /* Meta tracking must never break rendering */ }
    try { trackGA4ViewItem(product); } catch { /* GA4 tracking must never break rendering */ }
  }, [product]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen flex items-center justify-center text-slate-500">Loading…</main>
        <Footer />
      </>
    );
  }

  if (notFound || !product) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen flex items-center justify-center">
          <Container>
            <div className="text-center py-24">
              <span className="text-7xl mb-6 block">📦</span>
              <h1 className="text-2xl font-bold mb-3">Product not found</h1>
              <p className="text-slate-500 mb-8">This product may have been removed or the link is incorrect.</p>
              <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
            </div>
          </Container>
        </main>
        <Footer />
      </>
    );
  }

  const { name, price, compareAtPrice, category, brand, rating, reviewCount, badge, bgGradient, imageUrl, images, compatibleModels, description, stock } = product;
  const safePrice = Number(price) || 0;
  const safeCompareAtPrice = Number(compareAtPrice) || 0;
  const safeRating = Number(rating) || 0;
  const safeReviewCount = Number(reviewCount) || 0;
  const safeStock = Math.max(0, Number(stock) || 0);
  const gallery = images && images.length > 0 ? images : (imageUrl ? [{ id: 'primary', url: imageUrl }] : []);
  const activeImage = gallery[activeImageIndex]?.url || imageUrl;
  const onSale = safeCompareAtPrice > safePrice;
  const discountPct = onSale ? Math.round(((safeCompareAtPrice - safePrice) / safeCompareAtPrice) * 100) : 0;
  const compatibleSummary = compatibleModels.length > 0
    ? compatibleModels.slice(0, 4).join(', ') + (compatibleModels.length > 4 ? ' and more' : '')
    : '';
  const seoTitleBase = compatibleSummary
    ? `${name} by ${brand} for ${compatibleSummary}`
    : `${name} by ${brand}`;
  const genericSeoTitle = seoTitleBase.length > 58 ? seoTitleBase.slice(0, 58).replace(/\\s+\\S*$/, '') : seoTitleBase;
  const curatedSeo = CURATED_PRODUCT_SEO[product.slug] || null;
  const seoTitle = curatedSeo?.title || genericSeoTitle;
  const seoDescription = curatedSeo?.description || `${name} by ${brand} — Rs. ${safePrice.toLocaleString('en-PK')}. ${compatibleSummary ? `Compatible with ${compatibleSummary}. ` : ''}Shop online at Khan Mobile Shop with Cash on Delivery across Pakistan.`;
  const imageAlt = curatedSeo?.imageAlt || `${name} by ${brand}${compatibleSummary ? ` for ${compatibleSummary}` : ''}`;

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    category: category || undefined,
    isRelatedTo: related.length ? related.map((item) => ({ '@type': 'Product', name: item.name, sku: String(item.id) })) : undefined,
    name,
    description: seoDescription,
    image: gallery.map((img) => img.url).filter(Boolean),
    sku: String(product.id),
    brand: brand ? { '@type': 'Brand', name: brand } : undefined,
    offers: {
      '@type': 'Offer',
      url: `https://www.khanmobiles.store/product/${product.slug || product.id}`,
      priceCurrency: 'PKR',
      price: safePrice.toFixed(2),
      availability: safeStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    ...(safeReviewCount > 0 && safeRating > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: safeRating.toFixed(1),
        reviewCount: safeReviewCount,
        bestRating: '5',
        worstRating: '1',
      },
    } : {}),
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);

    trackTikTokAddToCart(product, quantity);

    // Meta AddToCart fires only from this actual "Add to Cart" action.
    // The action id is created once per click, so accidental duplicate
    // handler invocations with the same id are deduplicated by the manager.
    let actionId;
    try {
      actionId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    } catch {
      actionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
    trackMetaAddToCart(product, quantity, actionId);
    try { trackGA4AddToCart(product, quantity); } catch { /* GA4 tracking must never break rendering */ }
  };

  const handleBuyNow = () => {
    if (safeStock < 1) return;
    addItem(product, quantity);
    navigate('/checkout');
  };

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        path={`/product/${product.slug || product.id}`}
        image={activeImage}
        structuredData={{
          '@context': 'https://schema.org',
          '@graph': [
            productSchema,
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.khanmobiles.store/' },
                { '@type': 'ListItem', position: 2, name: 'Shop', item: 'https://www.khanmobiles.store/shop' },
                { '@type': 'ListItem', position: 3, name: category, item: 'https://www.khanmobiles.store/shop?category=' + encodeURIComponent(category) },
                { '@type': 'ListItem', position: 4, name, item: 'https://www.khanmobiles.store/product/' + (product.slug || product.id) },
              ],
            },
          ],
        }}
      />
      <Navbar />
      <main className="pt-16 min-h-screen">
        <Container>
          <nav className="py-6 text-sm text-slate-500 flex items-center gap-2 flex-wrap">
            <Link to="/" className="hover:text-accent transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-accent transition-colors">Shop</Link>
            <span>/</span>
            <Link to={`/shop?category=${encodeURIComponent(category)}`} className="hover:text-accent transition-colors">{category}</Link>
            <span>/</span>
            <span className="text-slate-600">{name}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 pb-16">
            <div>
              <motion.div
                key={activeImage}
                drag={gallery.length > 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, info) => {
                  const threshold = 50;
                  if (info.offset.x < -threshold && activeImageIndex < gallery.length - 1) {
                    setActiveImageIndex((i) => i + 1);
                  } else if (info.offset.x > threshold && activeImageIndex > 0) {
                    setActiveImageIndex((i) => i - 1);
                  }
                }}
                initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}
                className={`relative rounded-xl3 overflow-hidden h-80 md:h-[28rem] bg-slate-50 ${gallery.length > 1 ? 'touch-pan-y cursor-grab active:cursor-grabbing' : ''}`}
              >
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={imageAlt}
                    width="1200"
                    height="960"
                    fetchPriority="high"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-contain p-4 md:p-8"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div className="absolute inset-0" style={{ background: bgGradient }} aria-hidden="true" />
                )}
                <div className="absolute top-5 left-5 z-10 flex flex-col gap-2 items-start">
                  {badge && <Badge variant={badgeVariantMap[badge] || 'accent'}>{badge}</Badge>}
                  {onSale && <Badge variant="warning">-{discountPct}% OFF</Badge>}
                  {brand?.toLowerCase() === 'hottu' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm">
                      🛡️ 1 YEAR WARRANTY
                    </span>
                  )}
                </div>
              </motion.div>

              {gallery.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-3 md:hidden">
                  {gallery.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImageIndex(i)}
                      aria-label={`Go to image ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all ${i === activeImageIndex ? 'w-6 bg-accent' : 'w-1.5 bg-navy-700'}`}
                    />
                  ))}
                </div>
              )}

              {gallery.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                  {gallery.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImageIndex(i)}
                      aria-label={`View image ${i + 1}`}
                      className={`w-16 h-16 rounded-xl2 overflow-hidden bg-slate-50 border-2 transition-colors shrink-0 p-1 ${
                        i === activeImageIndex ? 'border-accent' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`${name} image ${i + 1}`}
                        width="96"
                        height="96"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <span className="text-xs font-semibold tracking-widest uppercase text-accent mb-3 block">{brand}</span>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-4">{name}</h1>

              <div className="flex items-center gap-3 mb-6">
                <StarRating rating={rating} />
                {reviewCount > 0
                  ? <span className="text-sm text-slate-500">{rating.toFixed(1)} · {reviewCount} review{reviewCount !== 1 ? 's' : ''}</span>
                  : <span className="text-sm text-slate-500">No reviews yet</span>}
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <p className="text-3xl font-extrabold text-slate-900">Rs. {price.toLocaleString('en-PK')}</p>
                {onSale && (
                  <p className="text-lg text-slate-400 line-through">Rs. {safeCompareAtPrice.toLocaleString('en-PK')}</p>
                )}
              </div>

              <p className="text-slate-500 leading-relaxed mb-4">
                {description || curatedSeo?.description || `The ${name} from ${brand} combines premium build quality with everyday reliability.`}
              </p>

              <p className={`text-sm font-medium mb-5 ${safeStock === 0 ? 'text-red-600' : safeStock < 10 ? 'text-orange-600' : 'text-green-600'}`}>
                {safeStock === 0 ? '✕ Out of stock' : safeStock < 10 ? `⚠ Only ${safeStock} left in stock` : '✓ In stock'}
              </p>

              <div className="grid grid-cols-2 gap-2 mb-7">
                <div className="rounded-xl2 border border-navy-700 bg-navy-800 px-3 py-2.5">
                  <p className="text-xs font-bold text-slate-800">🚚 Fast Delivery</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Across Pakistan</p>
                </div>
                <div className="rounded-xl2 border border-navy-700 bg-navy-800 px-3 py-2.5">
                  <p className="text-xs font-bold text-slate-800">💵 Cash on Delivery</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Available at checkout</p>
                </div>
                <div className="rounded-xl2 border border-navy-700 bg-navy-800 px-3 py-2.5">
                  <p className="text-xs font-bold text-slate-800">🔒 Secure Checkout</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Protected payment flow</p>
                </div>
                <div className="rounded-xl2 border border-navy-700 bg-navy-800 px-3 py-2.5">
                  <p className="text-xs font-bold text-slate-800">🛡️ Quality Checked</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{brand?.toLowerCase() === 'hottu' ? '1-year warranty' : 'Before dispatch'}</p>
                </div>
              </div>

              {compatibleModels?.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Compatible With</h3>
                  <div className="flex flex-wrap gap-2">
                    {compatibleModels.map((m) => (
                      <span key={m} className="text-xs px-3 py-1.5 rounded-full bg-navy-800 border border-navy-700 text-slate-600">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-3 bg-navy-800 border border-navy-700 rounded-xl2 px-2">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity"
                    className="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-slate-900 text-lg">−</button>
                  <span className="w-6 text-center text-slate-900 font-semibold">{quantity}</span>
                  <button onClick={() => setQuantity((q) => Math.min(safeStock, q + 1))} aria-label="Increase quantity"
                    className="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-slate-900 text-lg">+</button>
                </div>
                <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={stock === 0}>
                  {added ? '✓ Added!' : stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>
              <Button variant="secondary" size="lg" className="w-full" disabled={stock === 0} onClick={handleBuyNow}>
                Buy Now
              </Button>
              {!isAuthenticated && (
                <p className="text-xs text-slate-500 text-center mt-2">
                  You can continue as a guest — no account required.
                </p>
              )}

              <div className="mt-8 pt-6 border-t border-navy-700 text-center">
                <p className="text-xs text-slate-500">Need help before ordering? Contact us through the store support options.</p>
              </div>
            </motion.div>
          </div>

          <ReviewsSection productId={product.id} rating={rating} reviewCount={safeReviewCount} />

          {related.length > 0 && (
            <section className="pb-20">
              <h2 className="text-2xl font-extrabold mb-8">You May Also Like</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map((p) => (
                  <ProductCard key={p.id} {...p} />
                ))}
              </div>
            </section>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
};

export default ProductDetail;
