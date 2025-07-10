'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import InputField from '@/components/InputField';
import SubmitButton from '@/components/SubmitButton';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Login failed');
        return;
      }

      toast.success('Login successful');
      const user = data.user;
      router.push(user.role === 'ADMIN' ? '/admin-dashboard' : '/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#0b0d18] relative overflow-hidden px-4">
      {/* Glow Blobs */}
      <div className="absolute top-[10%] left-[-80px] w-[300px] h-[300px] bg-pink-500/20 rounded-full blur-[130px] animate-pulse-slow z-0"></div>
      <div className="absolute bottom-[-80px] right-[-40px] w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[160px] animate-pulse-slower z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 z-0"></div>

      {/* Card */}
      <div className="relative w-full max-w-lg p-[1px] rounded-[32px] bg-gradient-to-br from-white/10 to-white/5 shadow-[0_0_80px_rgba(255,255,255,0.05)] z-10">
        <div className="rounded-[30px] bg-white/5 backdrop-blur-xl px-10 py-12 border border-white/10 shadow-inner shadow-white/5">
          <h2 className="text-4xl font-extrabold text-center text-white mb-8 drop-shadow-[0_2px_4px_rgba(255,255,255,0.15)]">
            Welcome back
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
            <InputField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Your password"
            />
            <SubmitButton label="Login" loading={loading} />
          </form>

          <p className="text-sm text-gray-300 text-center mt-6">
            Don’t have an account?{' '}
            <a href="/register" className="text-blue-400 hover:underline font-semibold">
              Register here
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
