'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Flame } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { api } from '@/lib/api';
import { Product } from '@/types';

export default function TrendingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [trendingProducts, setTrendingProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    api.products.list({ trending: 'true', limit: '8' }).then((data) => { if (data?.products?.length) setTrendingProducts(data.products); }).catch(() => {});
  }, []);

  if (!trendingProducts) return <div className="py-24 flex justify-center"><span className="animate-pulse w-10 h-10 border-4 border-violet border-t-transparent rounded-full" /></div>;
  if (trendingProducts.length === 0) return null;

  return (
    <section ref={ref} className="py-16 lg:py-24 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-8 lg:mb-12"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame size={20} className="text-orange-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-violet">
                Hot Right Now
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black font-[family-name:var(--font-heading)] tracking-tight">
              Trending Now
            </h2>
          </div>
          <Link
            href="/products?filter=trending"
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            View All
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </motion.div>

        {/* Horizontal Scroll on Mobile, Grid on Desktop */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible">
          {trendingProducts.map((product, i) => (
            <div key={product.id} className="min-w-[260px] sm:min-w-[280px] lg:min-w-0">
              <ProductCard product={product} index={i} />
            </div>
          ))}
        </div>

        {/* Mobile "View All" */}
        <div className="flex sm:hidden justify-center mt-6">
          <Link
            href="/products?filter=trending"
            className="flex items-center gap-1 text-sm font-semibold text-violet"
          >
            View All Trending
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
