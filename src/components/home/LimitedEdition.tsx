'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Clock, Zap } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { api } from '@/lib/api';
import { Product } from '@/types';

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;
      if (distance < 0) return;
      setTimeLeft({
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-2">
      {Object.entries(timeLeft).map(([label, value]) => (
        <div key={label} className="flex items-center gap-1">
          <span className="bg-foreground text-background text-sm font-bold px-2.5 py-1.5 rounded-lg min-w-[36px] text-center tabular-nums">
            {String(value).padStart(2, '0')}
          </span>
          {label !== 'seconds' && <span className="text-muted-foreground font-bold">:</span>}
        </div>
      ))}
    </div>
  );
}

export default function LimitedEdition() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [limitedProducts, setLimitedProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    api.products.list({ badges: 'LIMITED', limit: '4' }).then((data) => { if (data?.products?.length) setLimitedProducts(data.products); }).catch(() => {});
  }, []);
  const dropDate = new Date(Date.now() + 12 * 60 * 60 * 1000);

  if (!limitedProducts) return <div className="py-24 flex justify-center"><span className="animate-pulse w-10 h-10 border-4 border-violet border-t-transparent rounded-full" /></div>;
  if (limitedProducts.length === 0) return null;

  return (
    <section ref={ref} className="py-16 lg:py-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 lg:mb-12"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={18} className="text-pink" />
              <span className="text-xs font-bold uppercase tracking-widest text-pink">
                Limited Edition
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black font-[family-name:var(--font-heading)] tracking-tight">
              Exclusive Drops 🔒
            </h2>
            <p className="text-muted-foreground text-sm mt-2">
              Once they&apos;re gone, they&apos;re gone. Don&apos;t sleep on it.
            </p>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-3">
            <Clock size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Next drop in</span>
            <CountdownTimer targetDate={dropDate} />
          </div>
        </motion.div>

        {/* Products */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {limitedProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {/* Notification CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
          className="mt-10 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 border-2 border-foreground text-foreground px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-foreground hover:text-background transition-all"
          >
            🔔 Notify Me for Next Drop
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
