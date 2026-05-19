'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const statusFilters = ['All', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-600', CONFIRMED: 'bg-blue-500/10 text-blue-600',
  PROCESSING: 'bg-orange-500/10 text-orange-600', SHIPPED: 'bg-indigo-500/10 text-indigo-600',
  DELIVERED: 'bg-green-500/10 text-green-600', CANCELLED: 'bg-red-500/10 text-red-600',
};

export default function AdminOrders() {
  const { getToken } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    const token = await getToken(); if (!token) return;
    try {
      const params: Record<string, string> = {};
      if (activeFilter !== 'All') params.status = activeFilter;
      const data = await api.orders.adminList(token, params);
      setOrders(data.orders);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [activeFilter]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    const token = await getToken(); if (!token) { setUpdatingId(null); return; }
    try {
      await api.orders.updateStatus(orderId, { status: newStatus }, token);
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (e: any) { toast.error(e.message); }
    setUpdatingId(null);
  };

  const filteredOrders = orders.filter((o) =>
    o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black font-[family-name:var(--font-heading)]">Orders</h2>
        <p className="text-sm text-muted-foreground mt-1">Track and manage customer orders</p>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {statusFilters.map((f) => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeFilter === f ? 'bg-foreground text-background' : 'bg-accent hover:bg-accent/80 text-muted-foreground'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search orders..."
          className="w-full bg-accent border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-violet transition-colors" />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-accent/50">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">Order</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">Customer</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">Items</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">Amount</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">Date</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">Status</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12"><div className="w-6 h-6 border-2 border-violet border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">No orders found</td></tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-accent/30 transition-colors">
                  <td className="px-5 py-4 text-sm font-bold">{order.orderNumber}</td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold">{order.user?.name || '—'}</p>
                    <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{order.items?.length || 0} items</td>
                  <td className="px-5 py-4 text-sm font-semibold">₹{order.total?.toLocaleString()}</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${statusColors[order.status] || ''}`}>{order.status}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <select value={order.status} disabled={updatingId === order.id}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      className="bg-accent border border-border rounded-lg px-2 py-1.5 text-xs disabled:opacity-50">
                      {['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
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
