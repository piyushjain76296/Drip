'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { Product } from '@/types';
import { useState, useEffect } from 'react';

const creators = [
  { name: 'Raj Shamani', handle: '@rajshamani', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
  { name: 'Ankush Bahuguna', handle: '@ankushbahuguna', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
  { name: 'Komal Pandey', handle: '@komalpandeyofficial', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
];

export default function CreatorPicks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api.products.list({ limit: '9' }).then((data) => { if (data?.products?.length) setProducts(data.products); }).catch(() => {});
  }, []);

  if (products.length < 9) return null; // Need 9 products to show 3 per creator

  return (
    <section ref={ref} className="py-16 lg:py-24 bg-accent/30">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 lg:mb-14"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-violet mb-2 block">
            Curated By
          </span>
          <h2 className="text-3xl lg:text-4xl font-black font-[family-name:var(--font-heading)] tracking-tight">
            Creator Picks ✨
          </h2>
          <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
            Handpicked by your favorite influencers and creators.
          </p>
        </motion.div>

        {/* Creator Cards - Horizontal Scroll */}
        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
          {creators.map((creator, i) => {
            const creatorProducts = products.slice(i * 3, i * 3 + 3);

            return (
              <motion.div
                key={creator.name}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="min-w-[320px] sm:min-w-[360px] bg-card border border-border rounded-2xl overflow-hidden card-hover flex-shrink-0"
              >
                {/* Creator Header */}
                <div className="flex items-center gap-3 p-5 border-b border-border">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted relative">
                    <Image
                      src={creator.avatar}
                      alt={creator.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{creator.name}</h4>
                    <p className="text-xs text-muted-foreground">{creator.handle}</p>
                  </div>
                  <span className="ml-auto text-xs font-semibold text-violet bg-violet/10 px-3 py-1 rounded-full">
                    Their Picks
                  </span>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-3 gap-1 p-1">
                  {creatorProducts.map((product) => product && (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="relative aspect-square bg-muted overflow-hidden group"
                    >
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="120px"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-2 opacity-0 group-hover:opacity-100">
                        <span className="text-[10px] font-bold text-white truncate">
                          ₹{product.price.toLocaleString()}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* View All */}
                <div className="p-4">
                  <Link
                    href="/products"
                    className="flex items-center justify-center gap-1 text-sm font-semibold text-violet hover:text-violet/80 transition-colors"
                  >
                    Shop Their Picks
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
