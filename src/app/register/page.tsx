'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import InputField from '@/components/InputField';
import SubmitButton from '@/components/SubmitButton';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Registration failed');
        return;
      }

      toast.success('Registration successful');
      router.push('/login');
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#0e0f1a] relative overflow-hidden px-4">
      {/* Immersive animated lighting blobs */}
      <div className="absolute top-[-100px] left-[-80px] w-[400px] h-[400px] bg-purple-500/30 blur-[140px] rounded-full animate-pulse-slow z-0"></div>
      <div className="absolute bottom-[-80px] right-[-80px] w-[400px] h-[400px] bg-blue-500/20 blur-[150px] rounded-full animate-pulse-slow z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 z-0"></div>

      {/* Auth Card */}
      <div className="relative w-full max-w-lg p-[1px] rounded-[32px] bg-gradient-to-br from-white/10 to-white/5 shadow-[0_0_80px_rgba(255,255,255,0.1)] z-10">
        <div className="rounded-[30px] bg-white/5 backdrop-blur-xl px-10 py-12 border border-white/10 shadow-inner shadow-white/5">
          <h2 className="text-4xl font-extrabold text-center text-white mb-8 drop-shadow-[0_2px_4px_rgba(255,255,255,0.15)]">
            Create your account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
            />
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
              placeholder="••••••••"
            />
            <SubmitButton label="Register" loading={loading} />
          </form>

          <p className="text-sm text-gray-300 text-center mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-blue-400 hover:underline font-semibold">
              Login here
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
