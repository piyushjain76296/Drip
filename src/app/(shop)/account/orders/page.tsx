'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, ArrowRight, Eye } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-600',
  CONFIRMED: 'bg-blue-500/10 text-blue-600',
  PROCESSING: 'bg-orange-500/10 text-orange-600',
  SHIPPED: 'bg-indigo-500/10 text-indigo-600',
  DELIVERED: 'bg-green-500/10 text-green-600',
  CANCELLED: 'bg-red-500/10 text-red-600',
};

export default function MyOrdersPage() {
  const { getToken } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const token = await getToken();
      if (!token) return;
      try {
        const data = await api.orders.list(token);
        setOrders(data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetch();
  }, [getToken]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="text-3xl font-black font-[family-name:var(--font-heading)] tracking-tight mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package size={64} className="text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">Start shopping to see your orders here.</p>
            <Link href="/products" className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-xl font-bold text-sm">
              Shop Now <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order.id} href={`/account/orders/${order.id}`}
                className="block bg-card border border-border rounded-2xl p-5 hover:bg-accent/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${statusColors[order.status] || ''}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{order.items?.length || 0} items</p>
                  <p className="font-bold">₹{order.total?.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
