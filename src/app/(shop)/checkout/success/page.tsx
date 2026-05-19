'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

function SuccessContent() {
  const params = useSearchParams();
  const orderNumber = params.get('orderNumber') || 'ORD-XXXX';
  const orderId = params.get('orderId') || '';

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-500" />
        </motion.div>
        <h1 className="text-3xl font-black mb-2">Order Placed! 🎉</h1>
        <p className="text-muted-foreground mb-2">Thank you for shopping with DRIP.</p>
        <p className="text-sm font-semibold mb-8">Order Number: <span className="text-violet">{orderNumber}</span></p>

        <div className="flex flex-col gap-3">
          {orderId && (
            <Link href={`/account/orders/${orderId}`}
              className="flex items-center justify-center gap-2 bg-foreground text-background py-3.5 rounded-xl font-bold text-sm">
              <Package size={16} /> Track Order
            </Link>
          )}
          <Link href="/products" className="flex items-center justify-center gap-2 bg-card border border-border py-3.5 rounded-xl font-semibold text-sm hover:bg-accent transition-colors">
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet border-t-transparent rounded-full animate-spin" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
