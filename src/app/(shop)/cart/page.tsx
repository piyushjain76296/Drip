'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft, Tag, Truck } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import ProductCard from '@/components/product/ProductCard';
import { api } from '@/lib/api';
import { Product } from '@/types';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, syncCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  useEffect(() => {
    setMounted(true);
    syncCart();
    api.products.list({ limit: '4' }).then(data => {
      if (data?.products) setRecommendedProducts(data.products);
    }).catch(() => {});
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = totalPrice >= 999 ? 0 : 99;
  const grandTotal = totalPrice + shipping;

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="text-3xl font-black font-[family-name:var(--font-heading)] tracking-tight mb-2">
          Shopping Bag
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          {totalItems} {totalItems === 1 ? 'item' : 'items'} in your bag
        </p>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <ShoppingBag size={80} className="text-muted-foreground/20 mx-auto mb-6" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Your bag is empty</h2>
            <p className="text-muted-foreground mb-8">
              Looks like you haven&apos;t found your DRIP yet.
            </p>
            <Link href="/products">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 rounded-xl font-bold text-sm"
              >
                Start Shopping
                <ArrowRight size={16} />
              </motion.span>
            </Link>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-3 lg:gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={`${item.product.id}-${item.size}-${item.color}`}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="flex gap-4 sm:gap-6 p-4 bg-card border border-border rounded-2xl"
                  >
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="relative w-24 h-32 sm:w-32 sm:h-40 rounded-xl overflow-hidden bg-muted flex-shrink-0"
                    >
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <Link href={`/products/${item.product.slug}`}>
                          <h3 className="font-bold text-sm sm:text-base hover:text-violet transition-colors">
                            {item.product.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1">
                          Size: {item.size} · Color: {item.color}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="font-bold">₹{item.product.price.toLocaleString()}</span>
                          {item.product.comparePrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              ₹{item.product.comparePrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-border rounded-xl">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                            className="p-2.5 hover:bg-accent transition-colors rounded-l-xl"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-4 py-2.5 font-semibold text-sm tabular-nums">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                            className="p-2.5 hover:bg-accent transition-colors rounded-r-xl"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm sm:text-base">
                            ₹{(item.product.price * item.quantity).toLocaleString()}
                          </span>
                          <button
                            onClick={() => removeItem(item.product.id, item.size, item.color)}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <div className="flex items-center justify-between pt-4">
                <Link
                  href="/products"
                  className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft size={16} />
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="mt-8 lg:mt-0">
              <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
                <h3 className="font-bold text-lg mb-6">Order Summary</h3>

                {/* Coupon */}
                <div className="flex gap-2 mb-6">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Coupon code"
                      className="w-full bg-accent border border-border rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-violet transition-colors"
                    />
                  </div>
                  <button className="px-5 py-3 text-sm font-semibold border border-border rounded-xl hover:bg-accent transition-colors">
                    Apply
                  </button>
                </div>

                {/* Breakdown */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                    <span className="font-semibold">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shipping === 0 ? 'text-green-500 font-semibold' : 'font-semibold'}>
                      {shipping === 0 ? 'FREE' : `₹${shipping}`}
                    </span>
                  </div>
                  {shipping === 0 && (
                    <div className="flex items-center gap-2 text-xs text-green-500 bg-green-500/10 px-3 py-2 rounded-lg">
                      <Truck size={14} />
                      You&apos;ve qualified for free shipping!
                    </div>
                  )}
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-bold text-base">Total</span>
                    <span className="font-black text-xl">₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <Link href="/checkout" className="block mt-6">
                  <motion.span
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full bg-foreground text-background py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    Proceed to Checkout
                    <ArrowRight size={16} />
                  </motion.span>
                </Link>

                <p className="text-[10px] text-muted-foreground text-center mt-3">
                  Secure checkout powered by Razorpay
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recommended Products */}
        {items.length > 0 && recommendedProducts.length > 0 && (
          <div className="mt-16 border-t border-border pt-12">
            <h2 className="text-2xl font-black font-[family-name:var(--font-heading)] mb-8">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {recommendedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
