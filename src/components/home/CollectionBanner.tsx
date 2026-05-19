'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { Collection } from '@/types';
import { useState, useEffect } from 'react';

export default function CollectionBanner() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [collections, setCollections] = useState<Collection[] | null>(null);

  useEffect(() => {
    api.collections.list().then((data) => { if (data?.length) setCollections(data); }).catch(() => {});
  }, []);

  if (!collections) return <div className="py-24 flex justify-center"><span className="animate-pulse w-10 h-10 border-4 border-violet border-t-transparent rounded-full" /></div>;
  if (collections.length === 0) return null;

  return (
    <section ref={ref} className="py-16 lg:py-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {collections.slice(0, 2).map((collection, i) => (
          <motion.div
            key={collection.id}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: i * 0.2 }}
          >
            <Link
              href={`/collections/${collection.slug}`}
              className="group relative block rounded-2xl lg:rounded-3xl overflow-hidden"
            >
              <div className="relative h-[300px] sm:h-[400px] lg:h-[500px]">
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  sizes="100vw"
                />
                {/* Gradient Overlay */}
                <div
                  className={`absolute inset-0 ${
                    i % 2 === 0
                      ? 'bg-gradient-to-r from-black/70 via-black/30 to-transparent'
                      : 'bg-gradient-to-l from-black/70 via-black/30 to-transparent'
                  }`}
                />
              </div>

              {/* Content */}
              <div
                className={`absolute inset-0 flex flex-col justify-center p-8 sm:p-12 lg:p-16 ${
                  i % 2 === 0 ? 'items-start' : 'items-end text-right'
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-widest text-white/70 mb-3">
                  Collection
                </span>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-[family-name:var(--font-heading)] tracking-tight max-w-md">
                  {collection.name}
                </h3>
                <p className="text-white/60 text-sm sm:text-base mt-3 max-w-sm">
                  {collection.description}
                </p>
                <motion.div
                  className="mt-6 bg-white text-black px-6 py-3 rounded-xl font-bold text-sm inline-flex items-center gap-2 group-hover:gap-3 transition-all"
                  whileHover={{ scale: 1.03 }}
                >
                  Shop Collection
                  <ArrowRight size={16} />
                </motion.div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
