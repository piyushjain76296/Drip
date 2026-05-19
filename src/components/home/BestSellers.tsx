'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Trophy } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { api } from '@/lib/api';
import { Product } from '@/types';

export default function BestSellers() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [bestSellers, setBestSellers] = useState<Product[] | null>(null);

  useEffect(() => {
    api.products.list({ badges: 'BESTSELLER', limit: '4' }).then((data) => { if (data?.products?.length) setBestSellers(data.products); }).catch(() => {});
  }, []);

  if (!bestSellers) return <div className="py-24 flex justify-center"><span className="animate-pulse w-10 h-10 border-4 border-violet border-t-transparent rounded-full" /></div>;
  if (bestSellers.length === 0) return null;

  return (
    <section ref={ref} className="py-16 lg:py-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-8 lg:mb-12"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={18} className="text-yellow-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-yellow-600 dark:text-yellow-400">
                Fan Favorites
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black font-[family-name:var(--font-heading)] tracking-tight">
              Best Sellers
            </h2>
          </div>
          <Link
            href="/products?filter=bestseller"
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            View All
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Products */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {bestSellers.map((product, i) => (
            <div key={product.id} className="relative">
              {/* Rank Badge */}
              <div className="absolute top-3 left-3 z-20 w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center font-black text-sm shadow-lg">
                #{i + 1}
              </div>
              <ProductCard product={product} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
