'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingCart, Users, Package, ArrowUpRight } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';

export default function AdminDashboard() {
  const { getToken } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const token = await getToken(); if (!token) { setLoading(false); return; }
      try { setStats(await api.dashboard.stats(token)); } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchStats();
  }, [getToken]);

  const statCards = [
    { label: 'Total Revenue', value: stats ? `₹${Number(stats.revenue).toLocaleString()}` : '—', icon: DollarSign, color: 'bg-green-500/10 text-green-500' },
    { label: 'Orders', value: stats?.orders ?? '—', icon: ShoppingCart, color: 'bg-violet/10 text-violet' },
    { label: 'Customers', value: stats?.customers ?? '—', icon: Users, color: 'bg-blue-500/10 text-blue-500' },
    { label: 'Products', value: stats?.products ?? '—', icon: Package, color: 'bg-pink/10 text-pink' },
  ];

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-500/10 text-yellow-600', CONFIRMED: 'bg-blue-500/10 text-blue-600',
    PROCESSING: 'bg-orange-500/10 text-orange-600', SHIPPED: 'bg-indigo-500/10 text-indigo-600',
    DELIVERED: 'bg-green-500/10 text-green-600', CANCELLED: 'bg-red-500/10 text-red-600',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black font-[family-name:var(--font-heading)]">Welcome back 👋</h2>
        <p className="text-sm text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your store.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}><Icon size={18} /></div>
              </div>
              <p className="text-2xl font-black">{loading ? '...' : stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-sm">Recent Orders</h3>
            <a href="/admin/orders" className="text-xs font-semibold text-violet hover:underline">View All</a>
          </div>
          {loading ? (
            <div className="text-center py-8"><div className="w-6 h-6 border-2 border-violet border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : (
            <div className="space-y-3">
              {(stats?.recentOrders || []).slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-semibold">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">{order.user?.name || order.user?.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">₹{order.total?.toLocaleString()}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${statusColors[order.status] || ''}`}>{order.status}</span>
                  </div>
                </div>
              ))}
              {(!stats?.recentOrders?.length) && <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-sm">Top Products</h3>
            <a href="/admin/products" className="text-xs font-semibold text-violet hover:underline">View All</a>
          </div>
          {loading ? (
            <div className="text-center py-8"><div className="w-6 h-6 border-2 border-violet border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : (
            <div className="space-y-3">
              {(stats?.topProducts || []).map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                  <span className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-xs font-bold text-muted-foreground">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p._sum?.quantity || 0} sold</p>
                  </div>
                </div>
              ))}
              {(!stats?.topProducts?.length) && <p className="text-sm text-muted-foreground text-center py-4">No sales yet</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
