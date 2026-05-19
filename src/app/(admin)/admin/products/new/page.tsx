'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, X, Plus, Save } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function ProductFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = !!params?.id;
  const { getToken } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: '', description: '', price: '', comparePrice: '', categoryId: '', collectionId: '',
    tags: '', stock: '', featured: false, trending: false, newArrival: false,
    sizes: 'S,M,L,XL,XXL', badges: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [colors, setColors] = useState([{ name: 'Jet Black', hex: '#0a0a0a' }]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, cols] = await Promise.all([api.categories.list(), api.collections.list()]);
        setCategories(cats); setCollections(cols);
      } catch (e) { console.error(e); }

      if (isEdit) {
        const token = await getToken();
        if (!token) return;
        try {
          const { product } = await api.products.get(params.id as string);
          setForm({
            name: product.name, description: product.description, price: String(product.price),
            comparePrice: String(product.comparePrice || ''), categoryId: product.categoryId,
            collectionId: product.collectionId || '', tags: product.tags.join(','),
            stock: String(product.stock), featured: product.featured, trending: product.trending,
            newArrival: product.newArrival, sizes: product.sizes.join(','), badges: product.badges.join(','),
          });
          setImages(product.images);
          setColors(product.colors as any[]);
        } catch (e) { console.error(e); }
      }
    };
    fetchData();
  }, [isEdit, params?.id, getToken]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    const token = await getToken();
    if (!token) { setUploading(false); return; }

    try {
      const files = Array.from(e.target.files);
      const results = await api.upload.multiple(files, 'drip-store/products', token);
      setImages([...images, ...results.map((r: any) => r.url)]);
      toast.success(`${files.length} image(s) uploaded`);
    } catch (err) { toast.error('Upload failed'); }
    setUploading(false);
  };

  const removeImage = (index: number) => setImages(images.filter((_, i) => i !== index));

  const addColor = () => setColors([...colors, { name: '', hex: '#000000' }]);
  const removeColor = (i: number) => setColors(colors.filter((_, idx) => idx !== i));
  const updateColor = (i: number, field: string, value: string) => {
    const updated = [...colors]; (updated[i] as any)[field] = value; setColors(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.categoryId || !images.length) {
      toast.error('Fill all required fields and add at least 1 image'); return;
    }

    setLoading(true);
    const token = await getToken();
    if (!token) { setLoading(false); return; }

    const data = {
      name: form.name, description: form.description, price: parseFloat(form.price),
      comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
      categoryId: form.categoryId, collectionId: form.collectionId || null,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      stock: parseInt(form.stock || '0'), featured: form.featured, trending: form.trending,
      newArrival: form.newArrival, images, colors,
      sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      badges: form.badges.split(',').map((b) => b.trim()).filter(Boolean),
    };

    try {
      if (isEdit) {
        await api.products.update(params.id as string, data, token);
        toast.success('Product updated!');
      } else {
        await api.products.create(data, token);
        toast.success('Product created!');
      }
      router.push('/admin/products');
    } catch (e: any) { toast.error(e.message); }
    setLoading(false);
  };

  const inputClass = "w-full bg-accent border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet transition-colors";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-accent rounded-lg"><ArrowLeft size={18} /></button>
        <h2 className="text-2xl font-black font-[family-name:var(--font-heading)]">
          {isEdit ? 'Edit Product' : 'Add Product'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Main Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-bold text-sm mb-4">Product Images *</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                  <Image src={img} alt="" fill className="object-cover" sizes="150px" />
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={12} />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-violet flex flex-col items-center justify-center cursor-pointer transition-colors">
                {uploading ? <div className="w-5 h-5 border-2 border-violet border-t-transparent rounded-full animate-spin" /> : (
                  <><Upload size={20} className="text-muted-foreground mb-1" /><span className="text-[10px] text-muted-foreground">Upload</span></>
                )}
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Details */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm">Product Details</h3>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name *" className={inputClass} />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={4} className={`${inputClass} resize-none`} />
            <div className="grid grid-cols-2 gap-4">
              <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price (₹) *" type="number" className={inputClass} />
              <input value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} placeholder="Compare price (₹)" type="number" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Stock quantity" type="number" className={inputClass} />
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Tags (comma-separated)" className={inputClass} />
            </div>
            <input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="Sizes (comma-separated)" className={inputClass} />
            <input value={form.badges} onChange={(e) => setForm({ ...form, badges: e.target.value })} placeholder="Badges: NEW, SALE, TRENDING, LIMITED, BESTSELLER" className={inputClass} />
          </div>

          {/* Colors */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Color Variants</h3>
              <button type="button" onClick={addColor} className="text-xs font-semibold text-violet flex items-center gap-1"><Plus size={12} /> Add</button>
            </div>
            {colors.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <input type="color" value={c.hex} onChange={(e) => updateColor(i, 'hex', e.target.value)} className="w-10 h-10 rounded-lg border-0 cursor-pointer" />
                <input value={c.name} onChange={(e) => updateColor(i, 'name', e.target.value)} placeholder="Color name" className="flex-1 bg-accent border border-border rounded-lg px-3 py-2 text-sm" />
                {colors.length > 1 && <button type="button" onClick={() => removeColor(i)} className="text-muted-foreground hover:text-destructive"><X size={16} /></button>}
              </div>
            ))}
          </div>
        </div>

        {/* Right — Sidebar */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm">Organization</h3>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={inputClass}>
              <option value="">Select category *</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={form.collectionId} onChange={(e) => setForm({ ...form, collectionId: e.target.value })} className={inputClass}>
              <option value="">Select collection (optional)</option>
              {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-sm">Visibility</h3>
            {['featured', 'trending', 'newArrival'].map((key) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} className="accent-[#8B5CF6] w-4 h-4" />
                <span className="text-sm capitalize">{key === 'newArrival' ? 'New Arrival' : key}</span>
              </label>
            ))}
          </div>

          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
            className="w-full bg-violet text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            <Save size={16} />
            {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
