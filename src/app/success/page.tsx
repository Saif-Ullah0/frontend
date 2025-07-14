"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle, Award, BookOpen, ArrowRight, Sparkles, Trophy, Star } from 'lucide-react';

// Custom Confetti Component
type ConfettiPieceProps = {
  x: number;
  y: number;
  color: string;
  delay: number;
};

const ConfettiPiece = ({ x, y, color, delay }: ConfettiPieceProps) => {
  return (
    <div
      className="absolute w-2 h-2 opacity-0 animate-confetti-fall"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        backgroundColor: color,
        animationDelay: `${delay}ms`,
        animationDuration: `${2000 + Math.random() * 1000}ms`
      }}
    />
  );
};

type ConfettiPieceType = { id: number; x: number; y: number; color: string; delay: number };

const Confetti = ({ isActive }: { isActive: boolean }) => {
  const [pieces, setPieces] = useState<ConfettiPieceType[]>([]);

  useEffect(() => {
    if (isActive) {
      const confettiPieces = [];
      const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
      
      for (let i = 0; i < 100; i++) {
        confettiPieces.push({
          id: i,
          x: Math.random() * 100,
          y: -10,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 1000
        });
      }
      setPieces(confettiPieces);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <ConfettiPiece
          key={piece.id}
          x={piece.x}
          y={piece.y}
          color={piece.color}
          delay={piece.delay}
        />
      ))}
    </div>
  );
};

// Floating Particles Component
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => (
    <div
      key={i}
      className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${3 + Math.random() * 4}s`
      }}
    />
  ));

  return <div className="absolute inset-0 overflow-hidden">{particles}</div>;
};

// Stats Component
type SuccessStatsProps = { isVisible: boolean };

const SuccessStats = ({ isVisible }: SuccessStatsProps) => {
  const stats = [
    { icon: BookOpen, label: 'Course Access', value: 'Lifetime', color: 'text-blue-400' },
    { icon: Trophy, label: 'Completion Rate', value: '95%', color: 'text-yellow-400' },
    { icon: Star, label: 'Student Rating', value: '4.9/5', color: 'text-purple-400' }
  ];

  return (
    <div className={`grid grid-cols-3 gap-4 transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300"
          style={{ animationDelay: `${1200 + index * 200}ms` }}
        >
          <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
          <div className="text-xs text-gray-400 mb-1">{stat.label}</div>
          <div className="text-sm font-semibold text-white">{stat.value}</div>
        </div>
      ))}
    </div>
  );
};

export default function SuccessPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Trigger animations in sequence
    const timer1 = setTimeout(() => setIsLoaded(true), 100);
    const timer2 = setTimeout(() => setShowConfetti(true), 500);
    const timer3 = setTimeout(() => setCurrentStep(1), 1000);
    const timer4 = setTimeout(() => setCurrentStep(2), 1500);
    const timer5 = setTimeout(() => setCurrentStep(3), 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, []);

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Advanced Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/40 to-slate-900" />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-gradient-to-r from-green-400/30 to-blue-500/30 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-gradient-to-l from-purple-500/30 to-pink-500/30 rounded-full blur-[120px] animate-pulse-slower" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-[100px] animate-float" />

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)`,
        backgroundSize: '50px 50px'
      }} />

      {/* Confetti */}
      <Confetti isActive={showConfetti} />

      {/* Main Content Container */}
      <div className={`relative z-10 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
        {/* Success Card */}
        <div className="bg-white/[0.08] backdrop-blur-2xl rounded-3xl p-12 max-w-2xl mx-auto text-center shadow-2xl border border-white/20 hover:border-white/30 transition-all duration-500">
          
          {/* Success Icon with Animation */}
          <div className={`mb-8 transition-all duration-700 delay-300 ${currentStep >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-gradient-to-r from-green-400 to-emerald-500 rounded-full p-4 shadow-lg">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className={`mb-8 transition-all duration-700 delay-500 ${currentStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400 bg-clip-text text-transparent mb-4">
              Payment Successful!
            </h1>
            <div className="flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-yellow-400 mr-2" />
              <span className="text-lg text-yellow-400 font-medium">Congratulations!</span>
            </div>
            <p className="text-xl text-gray-300 leading-relaxed max-w-lg mx-auto">
              You have successfully enrolled in the course. Your learning journey begins now!
            </p>
          </div>

          {/* Success Stats */}
          <div className="mb-10">
            <SuccessStats isVisible={currentStep >= 2} />
          </div>

          {/* Action Buttons */}
          <div className={`space-y-4 transition-all duration-700 delay-1000 ${currentStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/my-courses"
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-2xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                <BookOpen className="w-5 h-5 mr-2" />
                <span className="relative">Start Learning</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </a>
              
              <button className="group relative inline-flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-2xl text-white font-semibold backdrop-blur-sm transition-all duration-300 transform hover:scale-105">
                <div className="absolute inset-0 bg-white/5 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                <Trophy className="w-5 h-5 mr-2" />
                <span className="relative">View Certificate</span>
              </button>
            </div>
            
            <p className="text-sm text-gray-400 mt-6">
              Need help? <a href="/support" className="text-green-400 hover:text-green-300 underline underline-offset-2">Contact Support</a>
            </p>
          </div>
        </div>

        {/* Additional Success Elements */}
        <div className={`mt-12 text-center transition-all duration-1000 delay-1500 ${currentStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-2">What_s Next?</h3>
            <p className="text-gray-300 text-sm">
              Check your email for course materials and join our community Discord for support.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }
        
        @keyframes pulse-slower {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(1.1);
          }
        }
        
        .animate-confetti-fall {
          animation: confetti-fall linear infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-pulse-slower {
          animation: pulse-slower 6s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}