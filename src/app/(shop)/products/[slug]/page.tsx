'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, ShoppingBag, Star, Truck, RotateCcw, Shield, Share2,
  ChevronDown, ChevronUp, Minus, Plus, Check, Eye, Users
} from 'lucide-react';
import { api } from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';
import { useCartStore } from '@/stores/cart-store';
import { useWishlistStore } from '@/stores/wishlist-store';
import { useRecentlyViewedStore } from '@/stores/recently-viewed-store';
import { toast } from 'sonner';
import type { Product } from '@/types';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showDescription, setShowDescription] = useState(true);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [mounted, setMounted] = useState(false);

  const addToCart = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.items.some((item) => item.id === product?.id));
  const addRecentlyViewed = useRecentlyViewedStore((s) => s.addItem);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    setLoading(true);
    api.products.get(slug)
      .then((data) => {
        if (data.product) {
          setProduct(data.product);
          setRelatedProducts(data.related || []);
          setSelectedColor(data.product.colors?.[0]?.name || '');
          addRecentlyViewed(data.product);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="animate-pulse w-10 h-10 border-4 border-violet border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
          <p className="text-muted-foreground mb-4">The product you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/products" className="text-violet font-semibold hover:underline">
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
    toast.success('Added to bag! 🛍️', {
      description: `${product.name} — Size ${selectedSize}, ${selectedColor}`,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="pb-24 lg:pb-0">
      {/* Breadcrumb */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
          <span>/</span>
          <Link href={`/products?category=${product.category?.slug}`} className="hover:text-foreground transition-colors">
            {product.category?.name}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 xl:gap-16">
          {/* Image Gallery */}
          <div className="mb-8 lg:mb-0">
            {/* Main Image */}
            <motion.div
              className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted mb-3 cursor-zoom-in"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300"
                    style={isZoomed ? {
                      transform: 'scale(2)',
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    } : {}}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {product.badges.map((badge: string) => (
                  <span
                    key={badge}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                      badge === 'NEW' ? 'bg-violet text-white' :
                      badge === 'SALE' ? 'bg-pink text-white' :
                      badge === 'LIMITED' ? 'bg-red-600 text-white' :
                      badge === 'TRENDING' ? 'bg-orange-500 text-white' :
                      'bg-green-600 text-white'
                    }`}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Thumbnail Strip */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {product.images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-20 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0 border-2 transition-all ${
                    selectedImage === i ? 'border-violet' : 'border-transparent hover:border-border'
                  }`}
                >
                  <Image src={img} alt={`View ${i + 1}`} fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info - Sticky on Desktop */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {/* Category */}
            <Link
              href={`/products?category=${product.category?.slug}`}
              className="text-xs font-bold uppercase tracking-widest text-violet hover:underline"
            >
              {product.category?.name}
            </Link>

            {/* Name */}
            <h1 className="text-2xl lg:text-3xl font-black font-[family-name:var(--font-heading)] tracking-tight mt-2">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold">{product.rating}</span>
              <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mt-4">
              <span className="text-3xl font-black">₹{product.price.toLocaleString()}</span>
              {product.comparePrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    ₹{product.comparePrice.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Inclusive of all taxes</p>

            {/* Social Proof */}
            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye size={14} />
                {Math.floor(Math.random() * 30 + 10)} people viewing
              </span>
              <span className="flex items-center gap-1">
                <Users size={14} />
                {Math.floor(Math.random() * 100 + 50)} bought this week
              </span>
            </div>

            {/* Divider */}
            <div className="border-t border-border my-6" />

            {/* Color Picker */}
            <div className="mb-6">
              <h4 className="text-sm font-bold mb-3">
                Color: <span className="font-normal text-muted-foreground">{selectedColor}</span>
              </h4>
              <div className="flex gap-2">
                {product.colors.map((color: { name: string; hex: string }) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                      selectedColor === color.name
                        ? 'border-violet ring-2 ring-violet/30 scale-110'
                        : 'border-border hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {selectedColor === color.name && (
                      <Check size={14} className={color.hex === '#f5f5f5' || color.hex === '#ffffff' ? 'text-black' : 'text-white'} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold">
                  Size: <span className="font-normal text-muted-foreground">{selectedSize || 'Select a size'}</span>
                </h4>
                <button
                  onClick={() => setShowSizeChart(!showSizeChart)}
                  className="text-xs font-semibold text-violet hover:underline"
                >
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size: string) => (
                  <motion.button
                    key={size}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[48px] px-4 py-3 text-sm font-semibold border rounded-xl transition-all ${
                      selectedSize === size
                        ? 'border-violet bg-violet text-white'
                        : 'border-border hover:border-foreground'
                    }`}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <h4 className="text-sm font-bold mb-3">Quantity</h4>
              <div className="inline-flex items-center border border-border rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-accent transition-colors rounded-l-xl"
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="px-5 py-3 font-semibold text-sm min-w-[50px] text-center tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-accent transition-colors rounded-r-xl"
                >
                  <Plus size={16} />
                </button>
              </div>
              {product.stock <= 10 && (
                <span className="ml-3 text-xs font-medium text-pink">
                  Only {product.stock} left!
                </span>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3 mb-6">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleAddToCart}
                className="flex-1 bg-foreground text-background py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <ShoppingBag size={18} />
                Add to Bag
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  toggleWishlist(product);
                  toast(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist ❤️');
                }}
                className={`w-14 border rounded-xl flex items-center justify-center transition-all ${
                  isInWishlist
                    ? 'border-pink bg-pink/10 text-pink'
                    : 'border-border hover:border-foreground'
                }`}
              >
                <Heart size={20} className={isInWishlist ? 'fill-pink' : ''} />
              </motion.button>
              <button className="w-14 border border-border rounded-xl flex items-center justify-center hover:bg-accent transition-colors">
                <Share2 size={18} />
              </button>
            </div>

            {/* Delivery & Trust */}
            <div className="bg-accent/50 rounded-xl p-4 space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <Truck size={18} className="text-green-500 flex-shrink-0" />
                <span>Free delivery on orders above ₹999</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RotateCcw size={18} className="text-violet flex-shrink-0" />
                <span>Easy 15-day returns & exchanges</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield size={18} className="text-blue-500 flex-shrink-0" />
                <span>100% secure checkout</span>
              </div>
            </div>

            {/* Description Accordion */}
            <div className="border-t border-border">
              <button
                onClick={() => setShowDescription(!showDescription)}
                className="w-full flex items-center justify-between py-4 text-sm font-bold"
              >
                Product Description
                {showDescription ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <AnimatePresence>
                {showDescription && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="text-sm text-muted-foreground pb-4 leading-relaxed">
                      {product.description}
                    </p>
                    <div className="flex flex-wrap gap-2 pb-4">
                      {product.tags.map((tag: string) => (
                        <span key={tag} className="text-xs bg-accent px-2.5 py-1 rounded-md text-muted-foreground">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 lg:mt-24 border-t border-border pt-12">
          <h2 className="text-2xl font-black font-[family-name:var(--font-heading)] mb-8">
            Customer Reviews ({product.reviewCount})
          </h2>

          {/* Rating Summary */}
          <div className="flex flex-col sm:flex-row gap-8 mb-10">
            <div className="text-center sm:text-left">
              <div className="text-5xl font-black">{product.rating}</div>
              <div className="flex items-center gap-1 mt-2 justify-center sm:justify-start">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Based on {product.reviewCount} reviews</p>
            </div>

            {/* Rating Bars */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const percentage = stars === 5 ? 65 : stars === 4 ? 22 : stars === 3 ? 8 : stars === 2 ? 3 : 2;
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-xs font-medium w-3">{stars}</span>
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review Cards */}
          <div className="space-y-4">
            {product.reviews?.map((review: any, i: number) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet/10 flex items-center justify-center text-sm font-bold text-violet overflow-hidden relative">
                      {review.user?.avatar ? (
                        <Image src={review.user.avatar} alt={review.user.name} fill className="object-cover" />
                      ) : (
                        review.user?.name?.charAt(0) || 'U'
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        {review.user?.name || 'Anonymous'}
                        {review.verified && (
                          <span className="text-[10px] font-medium bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            <Check size={10} /> Verified
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 lg:mt-24 border-t border-border pt-12">
            <h2 className="text-2xl font-black font-[family-name:var(--font-heading)] mb-8">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((p: Product, i: number) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Add to Cart */}
      {mounted && (
        <div className="fixed bottom-16 left-0 right-0 z-40 lg:hidden glass border-t border-border p-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground line-through">
                {product.comparePrice ? `₹${product.comparePrice.toLocaleString()}` : ''}
              </p>
              <p className="text-lg font-black">₹{product.price.toLocaleString()}</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              className="flex-1 bg-foreground text-background py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            >
              <ShoppingBag size={16} />
              Add to Bag
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
