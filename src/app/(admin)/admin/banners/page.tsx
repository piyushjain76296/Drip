'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, X, Save } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminBannersPage() {
  const { getToken } = useAuthStore();
  const [banners, setBanners] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', subtitle: '', image: '', cta: '', link: '', active: true, order: 0 });
  const [uploading, setUploading] = useState(false);

  const fetchBanners = async () => {
    const token = await getToken();
    if (!token) return;
    try { setBanners(await api.banners.adminList(token)); } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    const token = await getToken();
    if (!token) { setUploading(false); return; }
    try {
      const result = await api.upload.single(e.target.files[0], 'drip-store/banners', token);
      setForm({ ...form, image: result.url });
    } catch { toast.error('Upload failed'); }
    setUploading(false);
  };

  const handleSave = async () => {
    const token = await getToken();
    if (!token) return;
    try {
      if (editId) { await api.banners.update(editId, form, token); toast.success('Banner updated'); }
      else { await api.banners.create(form, token); toast.success('Banner created'); }
      setShowForm(false); setEditId(null); setForm({ title: '', subtitle: '', image: '', cta: '', link: '', active: true, order: 0 });
      fetchBanners();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    const token = await getToken();
    if (!token) return;
    try { await api.banners.delete(id, token); toast.success('Banner deleted'); fetchBanners(); }
    catch (e: any) { toast.error(e.message); }
  };

  const startEdit = (b: any) => {
    setForm({ title: b.title, subtitle: b.subtitle || '', image: b.image, cta: b.cta || '', link: b.link || '', active: b.active, order: b.order });
    setEditId(b.id); setShowForm(true);
  };

  const inputClass = "w-full bg-accent border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black font-[family-name:var(--font-heading)]">Banners</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage homepage hero banners</p>
        </div>
        <motion.button whileTap={{ scale: 0.98 }} onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ title: '', subtitle: '', image: '', cta: '', link: '', active: true, order: 0 }); }}
          className="bg-violet text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2">
          <Plus size={16} /> Add Banner
        </motion.button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h3 className="font-bold">{editId ? 'Edit Banner' : 'New Banner'}</h3>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title *" className={inputClass} />
          <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Subtitle" className={inputClass} />
          <div className="flex gap-4">
            <input value={form.cta} onChange={(e) => setForm({ ...form, cta: e.target.value })} placeholder="CTA text" className={inputClass} />
            <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="Link URL" className={inputClass} />
          </div>

          {/* Image */}
          <div>
            {form.image ? (
              <div className="relative w-full h-40 rounded-xl overflow-hidden">
                <Image src={form.image} alt="" fill className="object-cover" sizes="600px" />
                <button type="button" onClick={() => setForm({ ...form, image: '' })} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center"><X size={14} /></button>
              </div>
            ) : (
              <label className="h-40 rounded-xl border-2 border-dashed border-border hover:border-violet flex flex-col items-center justify-center cursor-pointer">
                {uploading ? <div className="w-5 h-5 border-2 border-violet border-t-transparent rounded-full animate-spin" /> : <><Upload size={24} className="text-muted-foreground mb-2" /><span className="text-sm text-muted-foreground">Upload banner image</span></>}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} className="bg-violet text-white px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2"><Save size={14} /> Save</button>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="px-6 py-2.5 rounded-xl font-semibold text-sm border border-border">Cancel</button>
          </div>
        </div>
      )}

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((b) => (
          <div key={b.id} className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="relative h-32">
              {b.image && <Image src={b.image} alt={b.title} fill className="object-cover" sizes="400px" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-4">
                <p className="text-white font-bold text-sm">{b.title}</p>
                <p className="text-white/70 text-xs">{b.subtitle}</p>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${b.active ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                {b.active ? 'Active' : 'Inactive'}
              </span>
              <div className="flex gap-1">
                <button onClick={() => startEdit(b)} className="p-2 hover:bg-accent rounded-lg text-muted-foreground"><Edit size={14} /></button>
                <button onClick={() => handleDelete(b.id)} className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
