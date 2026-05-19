'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Tag, Save, X } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminCouponsPage() {
  const { getToken } = useAuthStore();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ code: '', type: 'PERCENTAGE' as 'PERCENTAGE' | 'FLAT', value: '', minOrder: '', maxDiscount: '', usageLimit: '', active: true, expiresAt: '' });

  const fetchCoupons = async () => {
    const token = await getToken(); if (!token) return;
    try { setCoupons(await api.coupons.list(token)); } catch (e) { console.error(e); }
  };
  useEffect(() => { fetchCoupons(); }, []);

  const handleSave = async () => {
    const token = await getToken(); if (!token) return;
    const data: any = {
      code: form.code, type: form.type, value: parseFloat(form.value), active: form.active,
      ...(form.minOrder ? { minOrder: parseFloat(form.minOrder) } : {}),
      ...(form.maxDiscount ? { maxDiscount: parseFloat(form.maxDiscount) } : {}),
      ...(form.usageLimit ? { usageLimit: parseInt(form.usageLimit) } : {}),
      ...(form.expiresAt ? { expiresAt: new Date(form.expiresAt) } : {}),
    };
    try {
      if (editId) { await api.coupons.update(editId, data, token); toast.success('Coupon updated'); }
      else { await api.coupons.create(data, token); toast.success('Coupon created'); }
      setShowForm(false); setEditId(null); fetchCoupons();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    const token = await getToken(); if (!token) return;
    try { await api.coupons.delete(id, token); toast.success('Coupon deleted'); fetchCoupons(); }
    catch (e: any) { toast.error(e.message); }
  };

  const startEdit = (c: any) => {
    setForm({ code: c.code, type: c.type, value: String(c.value), minOrder: c.minOrder ? String(c.minOrder) : '', maxDiscount: c.maxDiscount ? String(c.maxDiscount) : '', usageLimit: c.usageLimit ? String(c.usageLimit) : '', active: c.active, expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().split('T')[0] : '' });
    setEditId(c.id); setShowForm(true);
  };

  const inputClass = "w-full bg-accent border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-black font-[family-name:var(--font-heading)]">Coupons</h2><p className="text-sm text-muted-foreground mt-1">Manage discount codes</p></div>
        <motion.button whileTap={{ scale: 0.98 }} onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ code: '', type: 'PERCENTAGE', value: '', minOrder: '', maxDiscount: '', usageLimit: '', active: true, expiresAt: '' }); }}
          className="bg-violet text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2"><Plus size={16} /> Add Coupon</motion.button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h3 className="font-bold">{editId ? 'Edit Coupon' : 'New Coupon'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="Coupon code *" className={inputClass} />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className={inputClass}>
              <option value="PERCENTAGE">Percentage (%)</option><option value="FLAT">Flat Amount (₹)</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder={form.type === 'PERCENTAGE' ? 'Percentage *' : 'Amount (₹) *'} type="number" className={inputClass} />
            <input value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} placeholder="Min order (₹)" type="number" className={inputClass} />
            <input value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} placeholder="Max discount (₹)" type="number" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} placeholder="Usage limit" type="number" className={inputClass} />
            <input value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} placeholder="Expires" type="date" className={inputClass} />
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} className="bg-violet text-white px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2"><Save size={14} /> Save</button>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="px-6 py-2.5 rounded-xl font-semibold text-sm border border-border">Cancel</button>
          </div>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border bg-accent/50">
            <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3.5">Code</th>
            <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3.5">Type</th>
            <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3.5">Value</th>
            <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3.5">Usage</th>
            <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3.5">Status</th>
            <th className="text-right text-xs font-semibold text-muted-foreground uppercase px-5 py-3.5">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-accent/30">
                <td className="px-5 py-4"><span className="bg-violet/10 text-violet font-mono font-bold text-sm px-2 py-1 rounded">{c.code}</span></td>
                <td className="px-5 py-4 text-sm">{c.type === 'PERCENTAGE' ? `${c.value}%` : `₹${c.value}`}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{c.minOrder ? `Min ₹${c.minOrder}` : '—'}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{c.usageCount}/{c.usageLimit || '∞'}</td>
                <td className="px-5 py-4"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.active ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>{c.active ? 'Active' : 'Inactive'}</span></td>
                <td className="px-5 py-4 text-right">
                  <button onClick={() => startEdit(c)} className="p-2 hover:bg-accent rounded-lg text-muted-foreground"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
