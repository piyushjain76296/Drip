'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { signUp, loading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    const result = await signUp(email, password, name);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Account created! Welcome to DRIP. 💧');
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="text-4xl font-black tracking-tighter">DRIP</span>
            <span className="w-2.5 h-2.5 rounded-full bg-violet mt-2" />
          </Link>
          <h1 className="text-2xl font-bold mt-4">Join the DRIP fam</h1>
          <p className="text-muted-foreground text-sm mt-1">Create your account & get 15% off</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required
              className="w-full bg-card border border-border rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-violet transition-colors" />
          </div>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required
              className="w-full bg-card border border-border rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-violet transition-colors" />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6 characters)" required
              className="w-full bg-card border border-border rounded-xl pl-11 pr-12 py-3.5 text-sm focus:outline-none focus:border-violet transition-colors" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={loading}
            className="w-full bg-foreground text-background py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
            <ArrowRight size={16} />
          </motion.button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-violet font-semibold hover:underline">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
}
