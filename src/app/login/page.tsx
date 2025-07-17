'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, CheckCircle2 } from 'lucide-react';

type Particle = {
  id: number;
  left: string;
  top: string;
  animationDelay: string;
  animationDuration: string;
  size: 'w-1 h-1' | 'w-2 h-2';
};

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  // ✅ Generate particles on client side only to avoid hydration mismatch
  useEffect(() => {
    const generatedParticles: Particle[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 4}s`,
      animationDuration: `${4 + Math.random() * 3}s`,
      size: i % 2 === 0 ? 'w-2 h-2' : 'w-1 h-1'
    }));
    setParticles(generatedParticles);
  }, []);

  useEffect(() => {
    const isValid = form.email.includes('@') && form.password.length >= 6;
    setIsFormValid(isValid);
  }, [form]);

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

      const user = data.user;
      if (user.role === 'ADMIN') {
        toast.success(`Welcome back, Admin ${user.name}! 👑`);
        router.push('/admin/dashboard');
      } else {
        toast.success(`Welcome back, ${user.name}! 🎉`);
        router.push('/dashboard');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast.info('Forgot password feature coming soon!');
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0a0b14] via-[#0b0d18] to-[#1a0e2e] relative overflow-hidden px-4">
      {/* Enhanced animated background */}
      <div className="absolute top-[10%] left-[-80px] w-[300px] h-[300px] bg-gradient-to-r from-pink-500/25 to-rose-500/25 rounded-full blur-[130px] animate-pulse-slow z-0"></div>
      <div className="absolute bottom-[-80px] right-[-40px] w-[400px] h-[400px] bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-[160px] animate-pulse-slower z-0"></div>
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-[200px] animate-pulse-slower z-0"></div>
      
      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute rounded-full bg-white/10 animate-float ${particle.size}`}
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.animationDelay,
              animationDuration: particle.animationDuration
            }}
          />
        ))}
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-lg p-[1px] rounded-[32px] bg-gradient-to-br from-white/20 via-white/10 to-white/5 shadow-[0_0_100px_rgba(255,255,255,0.1)] z-10 animate-fade-in">
        <div className="rounded-[30px] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl px-10 py-12 border border-white/20 shadow-inner shadow-white/10 relative overflow-hidden">
          {/* Header glow effect */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/20 mb-4 group">
              <Shield className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-blue-200 drop-shadow-[0_2px_4px_rgba(255,255,255,0.15)]">
              Welcome Back
            </h2>
            <p className="text-gray-400 mt-2">Sign in to continue your learning journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400" />
                Email Address
              </label>
              <div className="relative group">
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 group-hover:border-white/20"
                  required
                />
                {form.email.includes('@') && (
                  <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400 animate-fade-in" />
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400" />
                Password
              </label>
              <div className="relative group">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-10 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 group-hover:border-white/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-all duration-300 hover:scale-110"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 transition-all duration-300 ${
                    rememberMe 
                      ? 'bg-cyan-500 border-cyan-500' 
                      : 'border-gray-400 group-hover:border-cyan-400'
                  }`}>
                    {rememberMe && (
                      <CheckCircle2 className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                  Remember me
                </span>
              </label>
              
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline transition-all duration-300"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${
                isFormValid && !loading
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg hover:shadow-cyan-500/25'
                  : 'bg-gray-600 cursor-not-allowed opacity-50'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>

          {/* Social Login Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/20"></div>
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/20"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => toast.info('Google login coming soon!')}
              className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-3 group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="group-hover:text-cyan-300 transition-colors">Continue with Google</span>
            </button>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-400">
              Dont have an account?{' '}
              <a href="/register" className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 font-semibold transition-all duration-300 hover:underline">
                Create one here
              </a>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.5; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-pulse-slower { animation: pulse-slower 6s ease-in-out infinite; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
      `}</style>
    </main>
  );
}