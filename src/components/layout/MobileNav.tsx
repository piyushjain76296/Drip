'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Search, Grid3X3, ShoppingBag, User } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';

const navItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Search, label: 'Search', href: '/search' },
  { icon: Grid3X3, label: 'Categories', href: '/products' },
  { icon: ShoppingBag, label: 'Cart', href: '/cart' },
  { icon: User, label: 'Account', href: '#' },
];

export default function MobileNav() {
  const pathname = usePathname();
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden glass border-t border-border/50">
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const isCart = item.label === 'Cart';

          return (
            <Link
              key={item.label}
              href={item.href}
              className="relative flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-colors"
            >
              <div className="relative">
                <Icon
                  size={22}
                  className={`transition-colors ${
                    isActive ? 'text-violet' : 'text-muted-foreground'
                  }`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                {isCart && cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    key={cartCount}
                    className="absolute -top-1.5 -right-2 w-4 h-4 bg-violet text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isActive ? 'text-violet' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-violet rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
      {/* Safe area spacer for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
