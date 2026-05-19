'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Package, MapPin, CreditCard, ArrowLeft, Truck } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';

const statusSteps = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-600', CONFIRMED: 'bg-blue-500/10 text-blue-600',
  PROCESSING: 'bg-orange-500/10 text-orange-600', SHIPPED: 'bg-indigo-500/10 text-indigo-600',
  DELIVERED: 'bg-green-500/10 text-green-600', CANCELLED: 'bg-red-500/10 text-red-600',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const { getToken } = useAuthStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const token = await getToken();
      if (!token || !id) return;
      try { setOrder(await api.orders.get(id as string, token)); } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetch();
  }, [getToken, id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet border-t-transparent rounded-full animate-spin" /></div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center"><p>Order not found</p></div>;

  const currentStep = statusSteps.indexOf(order.status);
  const addr = order.addressJson;

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Link href="/account/orders" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft size={16} /> Back to Orders
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black">{order.orderNumber}</h1>
            <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusColors[order.status]}`}>{order.status}</span>
        </div>

        {/* Status Tracker */}
        {order.status !== 'CANCELLED' && (
          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            <h2 className="font-bold text-sm mb-4 flex items-center gap-2"><Truck size={16} /> Order Tracking</h2>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-3 left-0 right-0 h-0.5 bg-border" />
              <div className="absolute top-3 left-0 h-0.5 bg-violet transition-all" style={{ width: `${Math.max(0, currentStep) / (statusSteps.length - 1) * 100}%` }} />
              {statusSteps.map((step, i) => (
                <div key={step} className="relative z-10 flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i <= currentStep ? 'bg-violet text-white' : 'bg-muted text-muted-foreground'}`}>
                    {i + 1}
                  </div>
                  <span className="text-[10px] mt-2 text-muted-foreground">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-sm mb-4 flex items-center gap-2"><Package size={16} /> Items ({order.items?.length})</h2>
          <div className="space-y-4">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex gap-4">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <Image src={item.image || item.product?.images?.[0] || ''} alt={item.name} fill className="object-cover" sizes="64px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Size: {item.size} · Color: {item.color}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    <p className="text-sm font-bold">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary + Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-bold text-sm mb-4"><CreditCard size={16} className="inline mr-2" />Payment Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{order.subtotal?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-green-500"><span>Discount</span><span>-₹{order.discount?.toLocaleString()}</span></div>}
              <div className="border-t border-border pt-2 flex justify-between font-bold"><span>Total</span><span>₹{order.total?.toLocaleString()}</span></div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-bold text-sm mb-4"><MapPin size={16} className="inline mr-2" />Delivery Address</h2>
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">{addr?.name}</p>
              <p>{addr?.line1}</p>
              {addr?.line2 && <p>{addr.line2}</p>}
              <p>{addr?.city}, {addr?.state} - {addr?.pincode}</p>
              <p>Phone: {addr?.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
