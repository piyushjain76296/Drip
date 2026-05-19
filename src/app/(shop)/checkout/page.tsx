'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, Tag, CreditCard, Plus, ArrowRight, Truck } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const { getToken } = useAuthStore();
  const { items, totalPrice, clearCart } = useCartStore();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddr, setSelectedAddr] = useState<string>('');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrForm, setAddrForm] = useState({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: true });
  const router = useRouter();

  useEffect(() => {
    const ensureAuth = async () => {
      const token = await getToken();
      if (!token) {
        toast.info('Sign in to checkout');
        router.replace('/auth/login?next=/checkout');
      }
    };
    void ensureAuth();
  }, [getToken, router]);

  const subtotal = totalPrice();
  const shipping = subtotal >= 999 ? 0 : 99;
  const grandTotal = subtotal - discount + shipping;

  useEffect(() => {
    const fetch = async () => {
      const token = await getToken();
      if (!token) return;
      try {
        const data = await api.addresses.list(token);
        setAddresses(data);
        const def = data.find((a: any) => a.isDefault);
        if (def) setSelectedAddr(def.id);
        else if (data.length) setSelectedAddr(data[0].id);
      } catch (e) { console.error(e); }
    };
    fetch();
  }, [getToken]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const result = await api.coupons.validate(couponCode, subtotal);
      setDiscount(result.discount);
      toast.success(`Coupon applied! ₹${result.discount} off`);
    } catch (e: any) { toast.error(e.message); setDiscount(0); }
  };

  const handleAddAddress = async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const addr = await api.addresses.create(addrForm, token);
      setAddresses([addr, ...addresses]);
      setSelectedAddr(addr.id);
      setShowAddrForm(false);
      toast.success('Address added!');
    } catch (e: any) { toast.error(e.message); }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddr) { toast.error('Please select a delivery address'); return; }
    if (!items.length) { toast.error('Cart is empty'); return; }

    setLoading(true);
    const token = await getToken();
    if (!token) { setLoading(false); return; }

    try {
      const orderData = {
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity, size: i.size, color: i.color })),
        addressId: selectedAddr,
        paymentMethod,
        couponCode: discount > 0 ? couponCode : undefined,
      };
      const order = await api.orders.create(orderData, token);
      clearCart();
      router.push(`/checkout/success?orderId=${order.id}&orderNumber=${order.orderNumber}`);
    } catch (e: any) { toast.error(e.message); }
    setLoading(false);
  };

  if (!items.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Add some items to checkout</p>
        <button onClick={() => router.push('/products')} className="bg-foreground text-background px-6 py-3 rounded-xl font-bold text-sm">Shop Now</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="text-3xl font-black font-[family-name:var(--font-heading)] tracking-tight mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Address & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Addresses */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold flex items-center gap-2"><MapPin size={18} /> Delivery Address</h2>
                <button onClick={() => setShowAddrForm(!showAddrForm)} className="text-sm font-semibold text-violet flex items-center gap-1">
                  <Plus size={14} /> Add New
                </button>
              </div>

              {showAddrForm && (
                <div className="mb-4 p-4 bg-accent rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input value={addrForm.name} onChange={(e) => setAddrForm({ ...addrForm, name: e.target.value })} placeholder="Full name" className="bg-card border border-border rounded-lg px-3 py-2.5 text-sm" />
                    <input value={addrForm.phone} onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })} placeholder="Phone" className="bg-card border border-border rounded-lg px-3 py-2.5 text-sm" />
                  </div>
                  <input value={addrForm.line1} onChange={(e) => setAddrForm({ ...addrForm, line1: e.target.value })} placeholder="Address line 1" className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm" />
                  <input value={addrForm.line2} onChange={(e) => setAddrForm({ ...addrForm, line2: e.target.value })} placeholder="Address line 2 (optional)" className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm" />
                  <div className="grid grid-cols-3 gap-3">
                    <input value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} placeholder="City" className="bg-card border border-border rounded-lg px-3 py-2.5 text-sm" />
                    <input value={addrForm.state} onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })} placeholder="State" className="bg-card border border-border rounded-lg px-3 py-2.5 text-sm" />
                    <input value={addrForm.pincode} onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value })} placeholder="Pincode" className="bg-card border border-border rounded-lg px-3 py-2.5 text-sm" />
                  </div>
                  <button onClick={handleAddAddress} className="bg-violet text-white px-4 py-2 rounded-lg text-sm font-semibold">Save Address</button>
                </div>
              )}

              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label key={addr.id} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${selectedAddr === addr.id ? 'border-violet bg-violet/5' : 'border-border'}`}>
                    <input type="radio" name="address" checked={selectedAddr === addr.id} onChange={() => setSelectedAddr(addr.id)} className="mt-1 accent-[#8B5CF6]" />
                    <div>
                      <p className="text-sm font-semibold">{addr.name} · {addr.phone}</p>
                      <p className="text-xs text-muted-foreground">{addr.line1}, {addr.line2 && `${addr.line2}, `}{addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>
                  </label>
                ))}
                {!addresses.length && !showAddrForm && <p className="text-sm text-muted-foreground">No addresses yet. Add one above.</p>}
              </div>
            </div>

            {/* Payment */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-bold flex items-center gap-2 mb-4"><CreditCard size={18} /> Payment Method</h2>
              <div className="space-y-3">
                {['COD', 'UPI', 'CARD'].map((m) => (
                  <label key={m} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer ${paymentMethod === m ? 'border-violet bg-violet/5' : 'border-border'}`}>
                    <input type="radio" name="payment" checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} className="accent-[#8B5CF6]" />
                    <span className="text-sm font-semibold">{m === 'COD' ? 'Cash on Delivery' : m === 'UPI' ? 'UPI Payment' : 'Credit / Debit Card'}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Order Summary */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
              <h2 className="font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4 max-h-48 overflow-auto">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{item.product.name}</p>
                      <p className="text-[10px] text-muted-foreground">{item.size} · {item.color} · x{item.quantity}</p>
                    </div>
                    <p className="text-xs font-bold">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Coupon code"
                    className="w-full bg-accent border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm" />
                </div>
                <button onClick={handleApplyCoupon} className="px-4 py-2.5 bg-foreground text-background rounded-lg text-sm font-bold">Apply</button>
              </div>

              <div className="space-y-2 text-sm border-t border-border pt-4">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className={shipping === 0 ? 'text-green-500' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-500"><span>Discount</span><span>-₹{discount.toLocaleString()}</span></div>}
                <div className="flex justify-between font-black text-lg border-t border-border pt-2"><span>Total</span><span>₹{grandTotal.toLocaleString()}</span></div>
              </div>

              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handlePlaceOrder} disabled={loading}
                className="w-full mt-4 bg-violet text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? 'Placing Order...' : 'Place Order'}
                <ArrowRight size={16} />
              </motion.button>

              <div className="flex items-center gap-2 justify-center mt-3 text-xs text-muted-foreground">
                <Truck size={12} /> Free shipping on orders above ₹999
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
