/* eslint-disable @next/next/no-html-link-for-pages */
export default function CancelPage() {
  return (
    <main className="relative min-h-screen bg-[#0b0e1a] text-white flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Glowing Background Orbs */}
      <div className="absolute top-[-80px] right-[-100px] w-[400px] h-[400px] bg-red-500/20 rounded-full blur-[160px] animate-pulse-slow z-0" />
      <div className="absolute bottom-[-100px] left-[-80px] w-[400px] h-[400px] bg-yellow-500/20 rounded-full blur-[140px] animate-pulse-slower z-0" />

      {/* Card */}
      <div className="relative z-10 bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-10 max-w-xl text-center shadow-xl">
        <h1 className="text-4xl font-bold text-red-400 mb-4">❌ Payment Cancelled</h1>
        <p className="text-lg text-gray-300 mb-6">
          Seems transaction has been canceled. You can try again anytime.
        </p>

        <a
          href="/categories"
          className="inline-block bg-red-600 hover:bg-red-700 transition-all px-6 py-3 rounded-xl text-white font-semibold shadow-md"
        >
          Back to Courses
        </a>
      </div>
    </main>
  );
}
