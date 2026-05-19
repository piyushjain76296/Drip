'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
} from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { useWishlistStore } from '@/stores/wishlist-store';
import { useAuthStore } from '@/stores/auth-store';

const navLinks = [
  {
    label: 'New Drops',
    href: '/products?filter=new',
    badge: '🔥',
  },
  {
    label: 'Men',
    href: '/products?category=men',
    children: [
      { label: 'Oversized Tees', href: '/products?category=oversized-tees' },
      { label: 'Hoodies', href: '/products?category=hoodies' },
      { label: 'Joggers', href: '/products?category=joggers' },
      { label: 'Jackets', href: '/products?category=jackets' },
      { label: 'Shorts', href: '/products?category=shorts' },
      { label: 'Polos', href: '/products?category=polos' },
    ],
  },
  {
    label: 'Collections',
    href: '/collections',
    children: [
      { label: '🎌 Anime Collection', href: '/collections/anime-collection' },
      { label: '🏙️ Streetwear Edit', href: '/collections/streetwear-edit' },
      { label: '✨ Minimal Basics', href: '/collections/minimal-basics' },
    ],
  },
  { label: 'Trending', href: '/products?filter=trending' },
  { label: 'Sale', href: '/products?filter=sale', badge: '40% OFF' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const cartItems = useCartStore((s) => s.items);
  const wishlistItems = useWishlistStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const syncCart = useCartStore((s) => s.syncCart);
  const user = useAuthStore((s) => s.user);
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (user) void syncCart();
  }, [user, syncCart]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-foreground text-background text-xs font-medium py-2 text-center overflow-hidden">
        <div className="animate-marquee whitespace-nowrap inline-block">
          <span className="mx-8">🔥 FREE SHIPPING ON ORDERS ABOVE ₹999</span>
          <span className="mx-8">⚡ NEW DROPS EVERY FRIDAY</span>
          <span className="mx-8">🎌 ANIME COLLECTION NOW LIVE</span>
          <span className="mx-8">💀 USE CODE DRIP20 FOR 20% OFF</span>
          <span className="mx-8">🔥 FREE SHIPPING ON ORDERS ABOVE ₹999</span>
          <span className="mx-8">⚡ NEW DROPS EVERY FRIDAY</span>
          <span className="mx-8">🎌 ANIME COLLECTION NOW LIVE</span>
          <span className="mx-8">💀 USE CODE DRIP20 FOR 20% OFF</span>
        </div>
      </div>

      {/* Main Navbar */}
      <motion.header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'glass border-b border-border/50 shadow-sm'
            : 'bg-background/80 backdrop-blur-sm'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 -ml-2 hover:bg-accent rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-1 group">
              <motion.span
                className="text-2xl lg:text-3xl font-black tracking-tighter font-[var(--font-heading)]"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                DRIP
              </motion.span>
              <span className="w-2 h-2 rounded-full bg-violet mt-2 group-hover:animate-bounce-subtle" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors rounded-lg hover:bg-accent"
                  >
                    {link.label}
                    {link.badge && (
                      <span className="text-[10px] font-bold bg-pink text-white px-1.5 py-0.5 rounded-full">
                        {link.badge}
                      </span>
                    )}
                    {link.children && (
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${
                          activeDropdown === link.label ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </Link>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {link.children && activeDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-1 w-56 glass rounded-xl border border-border/50 shadow-xl overflow-hidden p-2"
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="block px-4 py-2.5 text-sm text-foreground/80 hover:text-foreground hover:bg-accent rounded-lg transition-all"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <Link
                href="/search"
                className="p-2.5 hover:bg-accent rounded-lg transition-colors hidden sm:flex"
                aria-label="Search"
              >
                <Search size={20} />
              </Link>

              {/* Theme Toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2.5 hover:bg-accent rounded-lg transition-colors hidden sm:flex"
                  aria-label="Toggle theme"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={theme}
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </motion.div>
                  </AnimatePresence>
                </button>
              )}

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="p-2.5 hover:bg-accent rounded-lg transition-colors relative"
                aria-label="Wishlist"
              >
                <Heart size={20} />
                {mounted && wishlistItems.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-pink text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {wishlistItems.length}
                  </motion.span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={openCart}
                className="p-2.5 hover:bg-accent rounded-lg transition-colors relative"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                {mounted && cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    key={cartCount}
                    className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-violet text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>

              {/* User */}
              <Link
                href={user ? '/account' : '/auth/login'}
                className="p-2.5 hover:bg-accent rounded-lg transition-colors hidden sm:flex"
                aria-label={user ? 'Account' : 'Sign in'}
              >
                <User size={20} />
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-lg lg:hidden"
          >
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="pt-24 px-6 pb-8 h-full overflow-y-auto"
            >
              <div className="space-y-2">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-4 text-lg font-semibold hover:bg-accent rounded-xl transition-colors"
                    >
                      {link.label}
                      {link.badge && (
                        <span className="text-xs font-bold bg-pink text-white px-2 py-0.5 rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                    {link.children && (
                      <div className="pl-8 space-y-1">
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            onClick={() => setMobileOpen(false)}
                            className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-border">
                <div className="flex items-center gap-4">
                  {mounted && (
                    <button
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-accent rounded-xl transition-colors"
                    >
                      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
