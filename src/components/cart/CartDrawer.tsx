'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!mounted) return null;

  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const freeShippingThreshold = 999;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - totalPrice);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[61] w-full sm:w-[420px] bg-background border-l border-border flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} />
                <h2 className="text-lg font-bold font-[family-name:var(--font-heading)]">
                  Your Bag
                </h2>
                <span className="text-xs font-medium bg-violet/10 text-violet px-2 py-0.5 rounded-full">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Free Shipping Progress */}
            {items.length > 0 && (
              <div className="px-5 py-3 bg-accent/50">
                {remainingForFreeShipping > 0 ? (
                  <>
                    <p className="text-xs text-muted-foreground mb-2">
                      Add <span className="font-bold text-foreground">₹{remainingForFreeShipping}</span> more for{' '}
                      <span className="font-bold text-green-500">FREE shipping</span> 🚚
                    </p>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-violet to-pink rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (totalPrice / freeShippingThreshold) * 100)}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-xs font-medium text-green-500 flex items-center gap-1">
                    🎉 You&apos;ve unlocked FREE shipping!
                  </p>
                )}
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <ShoppingBag size={64} className="text-muted-foreground/30 mb-4" />
                  </motion.div>
                  <h3 className="text-lg font-semibold mb-2">Your bag is empty</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Looks like you haven&apos;t added anything yet.
                  </p>
                  <button
                    onClick={closeCart}
                    className="bg-foreground text-background px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={`${item.product.id}-${item.size}-${item.color}`}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      className="flex gap-4 p-3 bg-card rounded-xl border border-border"
                    >
                      {/* Image */}
                      <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.size} · {item.color}
                        </p>
                        <p className="text-sm font-bold mt-1.5">
                          ₹{item.product.price.toLocaleString()}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 bg-accent rounded-lg">
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)
                              }
                              className="p-1.5 hover:bg-muted rounded-l-lg transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-semibold w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)
                              }
                              className="p-1.5 hover:bg-muted rounded-r-lg transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.product.id, item.size, item.color)}
                            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border p-5 space-y-4">
                {/* Coupon Input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Coupon code"
                      className="w-full bg-accent border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-violet transition-colors"
                    />
                  </div>
                  <button className="px-4 py-2.5 text-sm font-semibold border border-border rounded-lg hover:bg-accent transition-colors">
                    Apply
                  </button>
                </div>

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className={totalPrice >= freeShippingThreshold ? 'text-green-500 font-medium' : ''}>
                      {totalPrice >= freeShippingThreshold ? 'FREE' : '₹99'}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                    <span>Total</span>
                    <span>
                      ₹{(totalPrice + (totalPrice >= freeShippingThreshold ? 0 : 99)).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full bg-foreground text-background py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  Checkout
                  <ArrowRight size={16} />
                </motion.button>

                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
