import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import Button from './Button';
import Container from './Container';

const SLIDE_DURATION = 5000;
const FEATURED_PRODUCT_NAMES = [
  'HOTTU TS06 ANC TWS Wireless Earbuds – 36H Playtime with ENC & Active Noise Cancellation',
  'Smart Watch Series X – Bluetooth Calling Smart Watch',
  'HOTTU BH03 Bluetooth Headphone – Wireless (16 Hours Playtime) with Micro SD & AUX',
];

const FALLBACK_PRODUCTS = [
  { id: 'fallback-ts06', name: FEATURED_PRODUCT_NAMES[0], category: 'Earbuds', imageUrl: '/images/airbuds.png', accentColor: '#22c55e' },
  { id: 'fallback-watch-x', name: FEATURED_PRODUCT_NAMES[1], category: 'Smartwatches', imageUrl: '/images/watch.png', accentColor: '#0EA5E9' },
  { id: 'fallback-bh03', name: FEATURED_PRODUCT_NAMES[2], category: 'Headphones', imageUrl: '/images/headphone.png', accentColor: '#a855f7' },
];

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
};

const getProductImage = (product) => product?.imageUrl || product?.image || product?.images?.[0] || '';

const OrangeDealsSlide = () => {
  const navigateTo = useNavigate();

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_55%_45%,white,transparent_32%)]" />
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[28px] border-white/10" />
      <div className="absolute -left-24 -bottom-36 h-96 w-96 rounded-full border-[24px] border-white/10" />

      <div className="relative z-10 h-full max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-20 flex items-center">
        <div className="w-[46%] max-w-2xl text-white">
          <span className="inline-flex items-center rounded-full bg-white px-4 py-2 text-xs sm:text-sm font-black tracking-wide text-orange-600 shadow-lg">
            🏷️ BIG DEALS ON TOP BRANDS
          </span>
          <h2 className="mt-4 text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.95] tracking-tight drop-shadow-md">
            UPGRADE YOUR
            <span className="block text-yellow-300">TECH TODAY</span>
          </h2>
          <p className="mt-4 max-w-xl text-sm sm:text-base lg:text-lg font-medium text-white/95">
            Latest mobiles, earbuds, accessories and more — all at the best prices!
          </p>
          <button
            type="button"
            onClick={() => navigateTo('/shop')}
            className="mt-6 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-base sm:text-lg font-black text-orange-600 shadow-xl transition-transform hover:scale-105"
          >
            Shop Now <span className="text-2xl leading-none">›</span>
          </button>
        </div>

        <div className="absolute left-[43%] right-[23%] top-1/2 -translate-y-1/2 h-[82%] flex items-end justify-center">
          <div className="absolute bottom-2 w-[72%] h-10 rounded-[50%] bg-black/20 blur-md" />
          <img src="/images/mobile.jpg" alt="Mobile phone" className="relative z-20 h-[88%] max-w-[28%] object-contain -mr-5 drop-shadow-2xl" />
          <img src="/images/watch.png" alt="Smart watch" className="relative z-30 h-[62%] max-w-[22%] object-contain -ml-3 -mr-5 drop-shadow-2xl" />
          <img src="/images/airbuds.png" alt="Wireless earbuds" className="relative z-40 h-[52%] max-w-[28%] object-contain drop-shadow-2xl" />
        </div>

        <div className="hidden lg:flex absolute right-[4%] top-1/2 -translate-y-1/2 w-44 h-44 xl:w-52 xl:h-52 rounded-full bg-yellow-100/95 border-8 border-yellow-300 items-center justify-center text-center shadow-2xl rotate-3">
          <div className="text-orange-600">
            <div className="text-sm font-black uppercase">UP TO</div>
            <div className="text-4xl xl:text-5xl font-black leading-none">50%</div>
            <div className="text-xl xl:text-2xl font-black">OFF</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GamingSlide = () => {
  const navigateTo = useNavigate();

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#090909]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_48%,rgba(245,158,11,0.32),transparent_34%)]" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(to_top,rgba(245,158,11,0.2),transparent)]" />

      <div className="relative z-10 h-full max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-20 flex items-center">
        <div className="w-[46%] max-w-2xl">
          <div className="text-xs sm:text-sm font-black tracking-wider text-white">
            <span className="inline-flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 text-black">▣</span>
              KHAN <span className="text-amber-400">MOBILES</span>
            </span>
          </div>
          <span className="mt-5 inline-flex rounded-full border border-amber-400/60 bg-amber-400/10 px-4 py-2 text-xs sm:text-sm font-bold text-amber-300">
            Gaming Series
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-7xl font-black leading-[0.95] text-white">
            Game Without
            <span className="block text-amber-400">Limits.</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base lg:text-lg text-slate-300">
            Low latency gaming earbuds with powerful sound.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigateTo('/shop')}
              className="rounded-full bg-amber-400 px-7 py-3 text-sm sm:text-base font-black text-black shadow-lg shadow-amber-500/20 transition-transform hover:scale-105"
            >
              Shop Now →
            </button>
            <span className="rounded-full border border-white/30 px-5 py-3 text-sm font-bold text-white">100% Original</span>
          </div>
        </div>

        <div className="absolute left-[40%] right-[26%] top-1/2 -translate-y-1/2 flex justify-center">
          <div className="absolute h-[75%] w-[75%] rounded-full border border-amber-400/30 shadow-[0_0_100px_rgba(245,158,11,0.25)]" />
          <img src="/images/airbuds.png" alt="Gaming earbuds" className="relative z-10 h-[72%] max-h-[330px] w-auto object-contain drop-shadow-[0_18px_35px_rgba(0,0,0,0.7)]" />
        </div>

        <div className="hidden lg:flex absolute right-[4%] top-1/2 -translate-y-1/2 w-60 flex-col gap-4">
          {['Powerful Sound', 'Low Latency', 'Fast Delivery'].map((item, index) => (
            <div key={item} className="rounded-2xl border border-white/15 bg-white/5 px-5 py-4 backdrop-blur-sm">
              <div className="flex items-center gap-3 text-white font-bold">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-black">{['◉', 'ϟ', '▣'][index]}</span>
                {item}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const HeroSlider = () => {
  const [[current, direction], setSlide] = useState([0, 1]);
  const timerRef = useRef(null);
  const navigateTo = useNavigate();

  const slides = [
    { id: 'orange-deals', type: 'orange' },
    { id: 'gaming-series', type: 'gaming' },
  ];

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSlide(([c]) => [(c + 1) % slides.length, 1]);
    }, SLIDE_DURATION);
  }, [slides.length]);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [startTimer]);

  const navigate = (idx, dir) => {
    setSlide([idx, dir]);
    startTimer();
  };

  const prev = () => navigate((current - 1 + slides.length) % slides.length, -1);
  const next = () => navigate((current + 1) % slides.length, 1);

  return (
    <section className="relative overflow-hidden h-[300px] sm:h-[340px] md:h-[400px] lg:h-[440px]">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={slides[current].id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          {slides[current].type === 'orange' ? <OrangeDealsSlide /> : <GamingSlide />}
        </motion.div>
      </AnimatePresence>

      <motion.button
        onClick={prev}
        aria-label="Previous slide"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="hidden md:flex absolute left-5 lg:left-7 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/20 border border-white/25 items-center justify-center text-white backdrop-blur-sm"
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
      </motion.button>

      <motion.button
        onClick={next}
        aria-label="Next slide"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="hidden md:flex absolute right-5 lg:right-7 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/20 border border-white/25 items-center justify-center text-white backdrop-blur-sm"
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
      </motion.button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((item, i) => (
          <motion.button
            key={item.id}
            onClick={() => navigate(i, i > current ? 1 : -1)}
            animate={{ width: i === current ? 24 : 8, backgroundColor: i === current ? '#ffffff' : 'rgba(255,255,255,0.45)' }}
            transition={{ duration: 0.25 }}
            className="h-2 rounded-full"
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
