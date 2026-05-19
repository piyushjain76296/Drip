// ============================================================
// DRIP. — Core TypeScript Types
// ============================================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: string;
  categorySlug: string;
  collection?: string;
  collectionSlug?: string;
  tags: string[];
  featured: boolean;
  trending: boolean;
  newArrival: boolean;
  stock: number;
  rating: number;
  reviewCount: number;
  colors: ColorVariant[];
  sizes: string[];
  badges: Badge[];
}

export interface ColorVariant {
  name: string;
  hex: string;
  image?: string;
}

export type Badge = 'NEW' | 'SALE' | 'TRENDING' | 'LIMITED' | 'BESTSELLER';

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export interface WishlistItem {
  product: Product;
  addedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  featured: boolean;
}

export interface Review {
  id: string;
  userName: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
  verified: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  cta: string;
  link: string;
}

export interface FilterState {
  categories: string[];
  sizes: string[];
  colors: string[];
  priceRange: [number, number];
  sortBy: 'newest' | 'price-low' | 'price-high' | 'popular' | 'rating';
}
