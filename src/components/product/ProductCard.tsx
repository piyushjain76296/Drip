'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/stores/cart-store';
import { useWishlistStore } from '@/stores/wishlist-store';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const badgeColors: Record<string, string> = {
  NEW: 'bg-violet text-white',
  SALE: 'bg-pink text-white',
  TRENDING: 'bg-orange-500 text-white',
  LIMITED: 'bg-red-600 text-white',
  BESTSELLER: 'bg-green-600 text-white',
};

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const addToCart = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, product.sizes[1] || product.sizes[0], product.colors[0].name);
    toast.success(`${product.name} added to bag!`, {
      description: `Size: ${product.sizes[1] || product.sizes[0]} · Color: ${product.colors[0].name}`,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 400);
    toast(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist ❤️', {
      description: product.name,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
    >
      <Link
        href={`/products/${product.slug}`}
        className="group block"
        onMouseEnter={() => {
          setIsHovered(true);
          if (product.images.length > 1) setImageIndex(1);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setImageIndex(0);
        }}
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted mb-3">
          {/* Product Image with hover swap */}
          <AnimatePresence mode="wait">
            <motion.div
              key={imageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Image
                src={product.images[imageIndex]}
                alt={product.name}
                fill
                className={`object-cover transition-transform duration-700 ${
                  isHovered ? 'scale-110' : 'scale-100'
                }`}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                priority={index < 4}
              />
            </motion.div>
          </AnimatePresence>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.badges.map((badge) => (
              <span
                key={badge}
                className={`text-[10px] font-bold px-2 py-1 rounded-md ${badgeColors[badge]}`}
              >
                {badge}
              </span>
            ))}
            {discount > 0 && (
              <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-pink text-white">
                -{discount}%
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full glass flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              size={16}
              className={`transition-colors ${isHeartAnimating ? 'animate-heart' : ''} ${
                isInWishlist ? 'fill-pink text-pink' : 'text-foreground'
              }`}
            />
          </button>

          {/* Quick Add - Slides up on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="absolute bottom-0 left-0 right-0 p-3 z-10"
              >
                <button
                  onClick={handleQuickAdd}
                  className="w-full bg-foreground text-background py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
                >
                  <ShoppingBag size={16} />
                  Quick Add
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Low stock indicator */}
          {product.stock <= 10 && product.stock > 0 && (
            <div className="absolute bottom-3 left-3 z-10">
              <span className="text-[10px] font-medium bg-background/80 backdrop-blur-sm text-foreground px-2 py-1 rounded-md flex items-center gap-1">
                <Eye size={10} />
                Only {product.stock} left
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-1.5 px-1">
          {/* Color Variants */}
          <div className="flex items-center gap-1.5">
            {product.colors.slice(0, 4).map((color) => (
              <span
                key={color.name}
                className="w-3.5 h-3.5 rounded-full border-2 border-background shadow-sm"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-[10px] text-muted-foreground font-medium">
                +{product.colors.length - 4}
              </span>
            )}
          </div>

          {/* Name */}
          <h3 className="text-sm font-semibold truncate group-hover:text-violet transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium">{product.rating}</span>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">₹{product.price.toLocaleString()}</span>
            {product.comparePrice && (
              <span className="text-xs text-muted-foreground line-through">
                ₹{product.comparePrice.toLocaleString()}
              </span>
            )}
            {discount > 0 && (
              <span className="text-xs font-semibold text-green-500">
                {discount}% off
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
