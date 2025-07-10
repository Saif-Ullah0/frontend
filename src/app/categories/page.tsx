import { fetchCategories } from '@/lib/api';
import Link from 'next/link';

type Category = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
};

export default async function CategoriesPage() {
  const categories = await fetchCategories();

  return (
    <main className="relative min-h-screen bg-[#0b0e1a] text-white overflow-hidden px-6 py-20">
      {/* Background Layers */}
      <div className="absolute top-[-80px] left-[-100px] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[160px] animate-pulse-slow z-0" />
      <div className="absolute bottom-[-100px] right-[-80px] w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[140px] animate-pulse-slower z-0" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 z-0" />

      {/* Heading */}
      <h1 className="relative z-10 text-5xl font-extrabold text-center mb-16 drop-shadow-[0_2px_4px_rgba(255,255,255,0.15)]">
        Explore Course Categories
      </h1>

      {/* Category Cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {categories.map((category: Category) => (
          <Link
            key={category.id}
            href={`/categories/${category.id}`}
            className="group relative bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl hover:scale-[1.025] transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_40px_rgba(0,0,0,0.4)]"
          >
            <div className="overflow-hidden rounded-xl mb-4">
              <img
                src={category.imageUrl}
                alt={category.name}
                className="w-full h-48 object-cover rounded-xl transform group-hover:scale-105 transition duration-300"
              />
            </div>
            <h2 className="text-2xl font-bold text-blue-400 mb-2">{category.name}</h2>
            <p className="text-sm text-gray-300 line-clamp-3">{category.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
