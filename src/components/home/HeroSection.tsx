'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { api } from '@/lib/api';
import { Banner } from '@/types';

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    api.banners.list().then((data) => { if (data?.length) setBanners(data); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight - 100, behavior: 'smooth' });
  };

  if (banners.length === 0) return <section className="relative h-[85vh] lg:h-[92vh] bg-foreground animate-pulse" />;

  return (
    <section className="relative h-[85vh] lg:h-[92vh] overflow-hidden bg-foreground">
      {/* Background Images with Crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={banners[currentSlide].image}
            alt={banners[currentSlide].title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Noise Texture */}
      <div className="absolute inset-0 noise pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-16 lg:pb-24 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="max-w-2xl"
          >
            {/* Category Tag */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-violet animate-pulse" />
              <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">
                {currentSlide === 0 ? 'New Season' : currentSlide === 1 ? 'Limited Edition' : 'Sale Live'}
              </span>
            </motion.div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[0.95] font-[family-name:var(--font-heading)] tracking-tight">
              {banners[currentSlide].title}
            </h1>

            {/* Subtitle */}
            <p className="text-base lg:text-lg text-white/70 mt-4 max-w-md">
              {banners[currentSlide].subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mt-8">
              <Link href={banners[currentSlide].link}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white text-black px-7 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-white/90 transition-colors"
                >
                  {banners[currentSlide].cta}
                  <ArrowRight size={16} />
                </motion.div>
              </Link>
              <Link href="/products">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-7 py-3.5 rounded-xl font-bold text-sm hover:bg-white/20 transition-colors"
                >
                  Explore All
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicators */}
        <div className="flex items-center gap-2 mt-10">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className="relative"
              aria-label={`Go to slide ${i + 1}`}
            >
              <div
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === currentSlide ? 'w-10 bg-white' : 'w-4 bg-white/30 hover:bg-white/50'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.button
        onClick={scrollToContent}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-white/60 hover:text-white transition-colors"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        aria-label="Scroll down"
      >
        <ChevronDown size={28} />
      </motion.button>
    </section>
  );
}
