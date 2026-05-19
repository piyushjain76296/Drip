'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { api } from '@/lib/api';
import { Category } from '@/types';

export default function CategoryGrid() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [categories, setCategories] = useState<Category[] | null>(null);

  useEffect(() => {
    api.categories.list().then((data) => { if (data?.length) setCategories(data); }).catch(() => {});
  }, []);

  if (!categories) return <div className="py-24 flex justify-center"><span className="animate-pulse w-10 h-10 border-4 border-violet border-t-transparent rounded-full" /></div>;
  if (categories.length === 0) return null;

  return (
    <section ref={ref} className="py-16 lg:py-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 lg:mb-14"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-violet mb-2 block">
            Shop by Category
          </span>
          <h2 className="text-3xl lg:text-4xl font-black font-[family-name:var(--font-heading)] tracking-tight">
            Find Your Style
          </h2>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {categories.map((category, i) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`${
                i === 0 ? 'col-span-2 lg:col-span-1 lg:row-span-2' : ''
              } ${i === 3 ? 'lg:col-span-2' : ''}`}
            >
              <Link
                href={`/products?category=${category.slug}`}
                className="group relative block rounded-2xl overflow-hidden bg-muted"
              >
                <div
                  className={`relative ${
                    i === 0 ? 'aspect-[2/1] lg:aspect-[3/4]' : i === 3 ? 'aspect-[2/1]' : 'aspect-square'
                  }`}
                >
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute inset-0 bg-violet/0 group-hover:bg-violet/10 transition-colors duration-500" />
                </div>

                {/* Label */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white text-lg lg:text-xl font-bold">
                    {category.name}
                  </h3>
                  <p className="text-white/60 text-sm mt-0.5">
                    {category.productCount} products
                  </p>
                </div>

                {/* Hover Arrow */}
                <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/0 group-hover:bg-white/20 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white">
                    <path d="M1 13L13 1M13 1H3M13 1V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
