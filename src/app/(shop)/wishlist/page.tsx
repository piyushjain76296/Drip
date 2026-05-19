'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlistStore } from '@/stores/wishlist-store';
import { useCartStore } from '@/stores/cart-store';
import ProductCard from '@/components/product/ProductCard';
import { toast } from 'sonner';

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const addToCart = useCartStore((s) => s.addItem);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleMoveToCart = (product: typeof items[0]) => {
    addToCart(product, product.sizes[1] || product.sizes[0], product.colors[0].name);
    removeItem(product.id);
    toast.success('Moved to bag!', { description: product.name });
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex items-center gap-3 mb-2">
          <Heart size={24} className="text-pink" />
          <h1 className="text-3xl font-black font-[family-name:var(--font-heading)] tracking-tight">
            Wishlist
          </h1>
        </div>
        <p className="text-muted-foreground text-sm mb-8">
          {items.length} {items.length === 1 ? 'item' : 'items'} saved
        </p>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Heart size={80} className="text-muted-foreground/20 mx-auto mb-6" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-8">
              Save your favorite items to find them later.
            </p>
            <Link href="/products">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 rounded-xl font-bold text-sm"
              >
                Explore Products
                <ArrowRight size={16} />
              </motion.span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {items.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
