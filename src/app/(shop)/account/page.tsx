'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Package, MapPin, Heart, LogOut, ChevronRight, Edit2, Save } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const { user, signOut, getToken } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = await getToken();
      if (!token) return;
      try {
        const data = await api.auth.profile(token);
        setProfile(data);
        setName(data.name || '');
        setPhone(data.phone || '');
      } catch (e) { console.error(e); }
    };
    fetchProfile();
  }, [getToken]);

  const handleSave = async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const updated = await api.auth.updateProfile({ name, phone }, token);
      setProfile(updated);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (e) { toast.error('Failed to update profile'); }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    toast.success('Signed out');
  };

  const menuItems = [
    { icon: Package, label: 'My Orders', href: '/account/orders', desc: 'Track & manage your orders' },
    { icon: MapPin, label: 'My Addresses', href: '/account/addresses', desc: 'Manage delivery addresses' },
    { icon: Heart, label: 'Wishlist', href: '/wishlist', desc: 'Your saved items' },
  ];

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="text-3xl font-black font-[family-name:var(--font-heading)] tracking-tight mb-8">My Account</h1>

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg">Profile</h2>
            <button onClick={() => editing ? handleSave() : setEditing(true)}
              className="flex items-center gap-1 text-sm font-semibold text-violet hover:underline">
              {editing ? <><Save size={14} /> Save</> : <><Edit2 size={14} /> Edit</>}
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-violet/10 flex items-center justify-center text-2xl font-bold text-violet">
              {(profile?.name || user?.email)?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              {editing ? (
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
                  className="text-lg font-bold bg-transparent border-b border-violet focus:outline-none" />
              ) : (
                <p className="text-lg font-bold">{profile?.name || 'Set your name'}</p>
              )}
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          {editing && (
            <div className="space-y-3">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number"
                className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet" />
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}
                className="flex items-center justify-between bg-card border border-border rounded-xl p-5 hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-violet/10 flex items-center justify-center">
                    <Icon size={18} className="text-violet" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </Link>
            );
          })}
        </div>

        {/* Sign Out */}
        <button onClick={handleSignOut}
          className="w-full mt-6 flex items-center justify-center gap-2 bg-card border border-border rounded-xl py-4 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors">
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
