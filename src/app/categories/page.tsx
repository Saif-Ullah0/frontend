'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Category = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
};

type Course = {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  category: {
    name: string;
  };
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Course[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch('http://localhost:5000/api/categories/public');
      const data = await res.json();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    const res = await fetch(`http://localhost:5000/api/courses/search?query=${searchQuery}`);
    const data = await res.json();
    setSearchResults(data);
    setLoading(false);
  };

  return (
    <main className="relative min-h-screen bg-[#0b0e1a] text-white overflow-hidden px-6 py-20">
      {/* Visual Background */}
      <div className="absolute top-[-80px] left-[-100px] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[160px] animate-pulse-slow z-0" />
      <div className="absolute bottom-[-100px] right-[-80px] w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[140px] animate-pulse-slower z-0" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 z-0" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-12 drop-shadow">
          Explore Categories & Search Courses
        </h1>

        {/* Search Bar */}
        <div className="flex items-center gap-4 mb-12 justify-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses..."
            className="px-4 py-2 w-full max-w-md rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring focus:border-blue-400"
          />
          <button
            onClick={handleSearch}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Search
          </button>
        </div>

        {/* Results or Categories */}
        {loading ? (
          <p className="text-center text-gray-300">Searching...</p>
        ) : searchResults !== null ? (
          <div>
            <h2 className="text-xl text-gray-400 mb-4">Search Results:</h2>
            {searchResults.length === 0 ? (
              <p className="text-gray-500">No courses found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {searchResults.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="block bg-white/5 border border-white/10 p-6 rounded-xl shadow hover:shadow-lg transition hover:scale-[1.02]"
                  >
                    <h3 className="text-xl font-bold text-blue-300">{course.title}</h3>
                    <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                      {course.description}
                    </p>
                    <p className="text-green-400 font-semibold mt-3">
                      {course.price === 0 ? 'Free' : `$${course.price}`}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <h2 className="text-xl text-gray-400 mb-4">All Categories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}`}
                  className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:scale-[1.02] transition shadow"
                >
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-36 object-cover rounded-xl mb-4"
                  />
                  <h3 className="text-2xl font-semibold text-blue-400 mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-300">{category.description}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
