'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Camera,
  MessageCircle,
  Play,
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  ArrowUp,
} from 'lucide-react';

const footerLinks = {
  shop: [
    { label: 'New Arrivals', href: '/products?filter=new' },
    { label: 'Best Sellers', href: '/products?filter=bestseller' },
    { label: 'Oversized Tees', href: '/products?category=oversized-tees' },
    { label: 'Hoodies', href: '/products?category=hoodies' },
    { label: 'Joggers', href: '/products?category=joggers' },
    { label: 'Accessories', href: '/products?category=accessories' },
  ],
  collections: [
    { label: 'Anime Collection', href: '/collections/anime-collection' },
    { label: 'Streetwear Edit', href: '/collections/streetwear-edit' },
    { label: 'Minimal Basics', href: '/collections/minimal-basics' },
    { label: 'Limited Editions', href: '/collections/limited-editions' },
  ],
  support: [
    { label: 'Contact Us', href: '#' },
    { label: 'Shipping Policy', href: '#' },
    { label: 'Returns & Exchange', href: '#' },
    { label: 'Size Guide', href: '#' },
    { label: 'FAQ', href: '#' },
    { label: 'Track Order', href: '#' },
  ],
};

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-foreground text-background relative overflow-hidden pb-20 lg:pb-0">
      {/* Newsletter Section */}
      <div className="border-b border-background/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">
                Join the DRIP fam 💧
              </h3>
              <p className="text-background/60 mt-2">
                Get 10% off your first order + early access to new drops.
              </p>
            </div>
            <div className="flex gap-2 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full bg-background/10 border border-background/20 rounded-xl px-5 py-3.5 text-sm text-background placeholder:text-background/40 focus:outline-none focus:border-violet transition-colors"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-violet hover:bg-violet/90 text-white px-6 py-3.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                Subscribe
                <ArrowRight size={16} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-1">
              <span className="text-3xl font-black tracking-tighter text-background">
                DRIP
              </span>
              <span className="w-2 h-2 rounded-full bg-violet mt-2" />
            </Link>
            <p className="text-background/50 text-sm mt-4 max-w-xs">
              Premium streetwear & anime-inspired fashion for the culture.
              Wear your identity.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: Camera, label: 'Instagram' },
                { icon: MessageCircle, label: 'Twitter' },
                { icon: Play, label: 'YouTube' },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-10 h-10 rounded-full bg-background/10 hover:bg-violet flex items-center justify-center transition-colors"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-background/80">
              Shop
            </h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/50 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Collections */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-background/80">
              Collections
            </h4>
            <ul className="space-y-3">
              {footerLinks.collections.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/50 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-background/80">
              Support
            </h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/50 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-background/40">
            © 2026 DRIP. All rights reserved. Made with 💜 in India.
          </p>
          <div className="flex items-center gap-4 text-xs text-background/40">
            <Link href="#" className="hover:text-background transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-background transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-background transition-colors">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>

      {/* Back to Top */}
      <motion.button
        onClick={scrollToTop}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute bottom-24 lg:bottom-8 right-6 w-10 h-10 bg-violet text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
        aria-label="Back to top"
      >
        <ArrowUp size={18} />
      </motion.button>
    </footer>
  );
}
