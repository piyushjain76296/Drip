'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, TrendingUp, Clock } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { api } from '@/lib/api';
import { Product } from '@/types';

const trendingSearches = ['Oversized Tees', 'Anime Hoodie', 'Cargo Joggers', 'Naruto', 'Streetwear'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.products.list({ trending: 'true', limit: '4' }).then(data => {
      if (data?.products) setPopularProducts(data.products);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      api.products.list({ search: query, limit: '20' })
        .then(data => setResults(data?.products || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Search Input */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products, collections, styles..."
              autoFocus
              className="w-full bg-accent border border-border rounded-2xl pl-14 pr-12 py-5 text-lg font-medium focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet/20 transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-5 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Results or Suggestions */}
        {query.trim() ? (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              {results.length} {results.length === 1 ? 'result' : 'results'} for &quot;{query}&quot;
            </p>

            {loading ? (
              <div className="flex justify-center py-16">
                <span className="animate-pulse w-10 h-10 border-4 border-violet border-t-transparent rounded-full" />
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg font-semibold mb-2">No results found</p>
                <p className="text-muted-foreground text-sm">
                  Try a different search term or browse our categories.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {results.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="max-w-2xl mx-auto">
            {/* Trending Searches */}
            <div className="mb-10">
              <h3 className="flex items-center gap-2 text-sm font-bold mb-4">
                <TrendingUp size={16} className="text-violet" />
                Trending Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-4 py-2.5 bg-accent border border-border rounded-xl text-sm font-medium hover:border-violet hover:text-violet transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Products */}
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold mb-4">
                🔥 Popular Right Now
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {popularProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
