'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { api } from '@/lib/api';
import { Product } from '@/types';

export default function NewDropsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [newProducts, setNewProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    api.products.list({ newArrival: 'true', limit: '4' }).then((data) => { if (data?.products?.length) setNewProducts(data.products); }).catch(() => {});
  }, []);

  if (!newProducts) return <div className="py-24 flex justify-center"><span className="animate-pulse w-10 h-10 border-4 border-violet border-t-transparent rounded-full" /></div>;
  if (newProducts.length === 0) return null;

  return (
    <section ref={ref} className="py-16 lg:py-24 bg-accent/30">
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
              <Sparkles size={18} className="text-violet" />
              <span className="text-xs font-bold uppercase tracking-widest text-pink">
                Just Dropped
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black font-[family-name:var(--font-heading)] tracking-tight">
              New Drops 💧
            </h2>
            <p className="text-muted-foreground text-sm mt-2">
              Fresh fits you can&apos;t find anywhere else.
            </p>
          </div>
          <Link
            href="/products?filter=new"
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            Shop All New
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {newProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
