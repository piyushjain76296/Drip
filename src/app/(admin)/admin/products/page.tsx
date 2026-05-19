'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminProducts() {
  const { getToken } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const params: Record<string, string> = { limit: '50' };
      if (searchQuery) params.search = searchQuery;
      const data = await api.products.list(params);
      setProducts(data.products);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [searchQuery]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    const token = await getToken();
    if (!token) return;
    try { await api.products.delete(id, token); toast.success('Product deleted'); fetchProducts(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-[family-name:var(--font-heading)]">Products</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your product catalog</p>
        </div>
        <Link href="/admin/products/new">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="bg-violet text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2">
            <Plus size={16} /> Add Product
          </motion.button>
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products..."
          className="w-full bg-accent border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-violet transition-colors" />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-accent/50">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">Product</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">Category</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">Price</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">Stock</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">Status</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12"><div className="w-6 h-6 border-2 border-violet border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">No products found</td></tr>
              ) : products.map((product) => (
                <tr key={product.id} className="hover:bg-accent/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {product.images?.[0] && <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="48px" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate max-w-[200px]">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{product.category?.name || '—'}</td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold">₹{product.price?.toLocaleString()}</p>
                    {product.comparePrice && <p className="text-xs text-muted-foreground line-through">₹{product.comparePrice.toLocaleString()}</p>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-sm font-semibold ${product.stock <= 10 ? 'text-red-500' : product.stock <= 30 ? 'text-yellow-500' : 'text-green-500'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${product.stock > 0 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/products/${product.slug}`} className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground"><Eye size={15} /></Link>
                      <Link href={`/admin/products/${product.id}/edit`} className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground"><Edit size={15} /></Link>
                      <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-destructive"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
