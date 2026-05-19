'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, Grid3X3, LayoutGrid } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import { api } from '@/lib/api';
import { Product } from '@/types';

const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-low' },
  { label: 'Price: High to Low', value: 'price-high' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Top Rated', value: 'rating' },
];

const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL'];
const colorOptions = [
  { name: 'Black', hex: '#0a0a0a' },
  { name: 'White', hex: '#f5f5f5' },
  { name: 'Grey', hex: '#808080' },
  { name: 'Navy', hex: '#001f3f' },
  { name: 'Olive', hex: '#4a5043' },
  { name: 'Red', hex: '#c41e3a' },
];

const categoryOptions = [
  'Oversized Tees', 'Hoodies', 'Joggers', 'Jackets', 'T-Shirts', 'Shorts', 'Accessories', 'Polos', 'Sweatshirts'
];

function ProductsContent() {
  const searchParams = useSearchParams();
  
  const initialCategory = searchParams.get('category');
  const initialFilter = searchParams.get('filter');
  
  const [sortBy, setSortBy] = useState('newest');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [showFilters, setShowFilters] = useState(false);
  const [gridCols, setGridCols] = useState<2 | 3>(3);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const toggleFilter = (arr: string[], value: string, setter: (val: string[]) => void) => {
    setter(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {
      limit: '50'
    };
    
    if (selectedCategories.length === 1) {
      params.category = selectedCategories[0].toLowerCase().replace(/\s+/g, '-');
    }
    
    if (selectedSizes.length > 0) {
      params.sizes = selectedSizes.join(',');
    }
    
    if (initialFilter === 'trending') params.trending = 'true';
    if (initialFilter === 'new') params.newArrival = 'true';
    if (initialFilter === 'bestseller') params.badges = 'BESTSELLER';
    if (initialFilter === 'sale') params.badges = 'SALE';
    
    if (sortBy !== 'newest') {
      params.sort = sortBy;
    }

    api.products.list(params).then((data) => {
      let result = data?.products || [];
      // Client-side filtering for multiple categories or colors since backend might not support complex OR on categories
      if (selectedCategories.length > 1) {
        result = result.filter((p: Product) => selectedCategories.includes(p.category));
      }
      if (selectedColors.length > 0) {
        result = result.filter((p: Product) => p.colors.some((c: any) => selectedColors.includes(c.name)));
      }
      setProducts(result);
    }).finally(() => {
      setLoading(false);
    });
  }, [selectedCategories, selectedSizes, selectedColors, sortBy, initialFilter]);

  const activeFilterCount = selectedSizes.length + selectedColors.length + selectedCategories.length;

  const clearAllFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedCategories([]);
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      {/* Page Header */}
      <div className="bg-accent/30 py-8 lg:py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl lg:text-4xl font-black font-[family-name:var(--font-heading)] tracking-tight">
            All Products
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            {loading ? 'Loading products...' : `${products.length} products`}
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-accent transition-colors"
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-violet text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Grid Toggle - Desktop */}
            <div className="hidden lg:flex items-center gap-1 border border-border rounded-xl p-1">
              <button
                onClick={() => setGridCols(2)}
                className={`p-1.5 rounded-lg transition-colors ${gridCols === 2 ? 'bg-accent' : ''}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setGridCols(3)}
                className={`p-1.5 rounded-lg transition-colors ${gridCols === 3 ? 'bg-accent' : ''}`}
              >
                <Grid3X3 size={16} />
              </button>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-violet transition-colors cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleFilter(selectedCategories, cat, setSelectedCategories)}
                className="flex items-center gap-1 bg-violet/10 text-violet text-xs font-medium px-3 py-1.5 rounded-full"
              >
                {cat} <X size={12} />
              </button>
            ))}
            {selectedSizes.map((size) => (
              <button
                key={size}
                onClick={() => toggleFilter(selectedSizes, size, setSelectedSizes)}
                className="flex items-center gap-1 bg-violet/10 text-violet text-xs font-medium px-3 py-1.5 rounded-full"
              >
                Size: {size} <X size={12} />
              </button>
            ))}
            {selectedColors.map((color) => (
              <button
                key={color}
                onClick={() => toggleFilter(selectedColors, color, setSelectedColors)}
                className="flex items-center gap-1 bg-violet/10 text-violet text-xs font-medium px-3 py-1.5 rounded-full"
              >
                {color} <X size={12} />
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 260, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="hidden lg:block flex-shrink-0 overflow-hidden"
              >
                <div className="w-[260px] space-y-6 sticky top-24">
                  {/* Categories */}
                  <div>
                    <h4 className="font-bold text-sm mb-3">Category</h4>
                    <div className="space-y-2">
                      {categoryOptions.map((cat) => (
                        <label
                          key={cat}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat)}
                            onChange={() => toggleFilter(selectedCategories, cat, setSelectedCategories)}
                            className="w-4 h-4 rounded border-border accent-violet"
                          />
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                            {cat}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sizes */}
                  <div>
                    <h4 className="font-bold text-sm mb-3">Size</h4>
                    <div className="flex flex-wrap gap-2">
                      {sizeOptions.map((size) => (
                        <button
                          key={size}
                          onClick={() => toggleFilter(selectedSizes, size, setSelectedSizes)}
                          className={`px-3.5 py-2 text-xs font-semibold border rounded-lg transition-all ${
                            selectedSizes.includes(size)
                              ? 'border-violet bg-violet text-white'
                              : 'border-border hover:border-foreground'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <h4 className="font-bold text-sm mb-3">Color</h4>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => toggleFilter(selectedColors, color.name, setSelectedColors)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            selectedColors.includes(color.name)
                              ? 'border-violet scale-110 ring-2 ring-violet/30'
                              : 'border-border hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          <div className="flex-1 min-h-[500px]">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <span className="animate-pulse w-10 h-10 border-4 border-violet border-t-transparent rounded-full" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg font-semibold mb-2">No products found</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Try adjusting your filters.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="text-sm font-semibold text-violet hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div
                className={`grid grid-cols-2 gap-4 ${
                  gridCols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
                } lg:gap-6`}
              >
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl border-t border-border max-h-[80vh] overflow-y-auto lg:hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="p-2">
                    <X size={20} />
                  </button>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h4 className="font-bold text-sm mb-3">Category</h4>
                  <div className="flex flex-wrap gap-2">
                    {categoryOptions.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => toggleFilter(selectedCategories, cat, setSelectedCategories)}
                        className={`px-3 py-1.5 text-xs font-medium border rounded-full transition-all ${
                          selectedCategories.includes(cat)
                            ? 'border-violet bg-violet text-white'
                            : 'border-border'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div className="mb-6">
                  <h4 className="font-bold text-sm mb-3">Size</h4>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map((size) => (
                      <button
                        key={size}
                        onClick={() => toggleFilter(selectedSizes, size, setSelectedSizes)}
                        className={`px-4 py-2 text-xs font-semibold border rounded-lg transition-all ${
                          selectedSizes.includes(size)
                            ? 'border-violet bg-violet text-white'
                            : 'border-border'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className="mb-6">
                  <h4 className="font-bold text-sm mb-3">Color</h4>
                  <div className="flex flex-wrap gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => toggleFilter(selectedColors, color.name, setSelectedColors)}
                        className={`w-9 h-9 rounded-full border-2 transition-all ${
                          selectedColors.includes(color.name)
                            ? 'border-violet ring-2 ring-violet/30 scale-110'
                            : 'border-border'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Apply */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <button
                    onClick={clearAllFilters}
                    className="flex-1 py-3 border border-border rounded-xl font-semibold text-sm"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 py-3 bg-foreground text-background rounded-xl font-semibold text-sm"
                  >
                    Show {products.length} Results
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="animate-pulse w-10 h-10 border-4 border-violet border-t-transparent rounded-full" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
