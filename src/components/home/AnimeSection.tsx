'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { api } from '@/lib/api';
import { Product } from '@/types';

export default function AnimeSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [animeProducts, setAnimeProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    api.products.list({ collection: 'anime-collection', limit: '4' }).then((data) => { if (data?.products?.length) setAnimeProducts(data.products); }).catch(() => {});
  }, []);

  if (!animeProducts) return <div className="py-24 flex justify-center"><span className="animate-pulse w-10 h-10 border-4 border-violet border-t-transparent rounded-full" /></div>;
  if (animeProducts.length === 0) return null;

  return (
    <section
      ref={ref}
      className="py-16 lg:py-24 relative overflow-hidden bg-foreground text-background"
    >
      {/* Neon Glow Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-violet/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-pink/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet/5 rounded-full blur-[160px]" />
      </div>

      {/* Noise */}
      <div className="absolute inset-0 noise pointer-events-none opacity-50" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-8 lg:mb-12"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🎌</span>
              <span className="text-xs font-bold uppercase tracking-widest text-violet">
                Anime × Streetwear
              </span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-black font-[family-name:var(--font-heading)] tracking-tight">
              <span className="gradient-text">Anime Collection</span>
            </h2>
            <p className="text-background/50 text-sm mt-2 max-w-md">
              Wear your fandom. Premium anime-inspired streetwear for the culture.
            </p>
          </div>
          <Link
            href="/collections/anime-collection"
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-background/60 hover:text-background transition-colors group"
          >
            Explore Collection
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Products - Horizontal Scroll on mobile */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible">
          {animeProducts.map((product, i) => (
            <div key={product.id} className="min-w-[260px] sm:min-w-[280px] lg:min-w-0">
              <ProductCard product={product} index={i} />
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link href="/collections/anime-collection">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet to-pink text-white px-8 py-4 rounded-xl font-bold text-sm animate-glow"
            >
              Shop All Anime
              <ArrowRight size={16} />
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
