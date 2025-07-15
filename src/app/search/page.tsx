'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`http://localhost:5000/api/courses/search?query=${query}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0b0e1a] text-white px-6 py-20">
      <h1 className="text-4xl font-bold text-center mb-8 text-blue-400">Search Courses</h1>

      <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-10 flex">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title or category..."
          className="flex-grow px-4 py-2 rounded-l-lg bg-white/10 border border-white/20 text-white"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-r-lg font-semibold"
        >
          Search
        </button>
      </form>

      {loading && <p className="text-center text-gray-400">Searching...</p>}

      {!loading && searched && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {results.length > 0 ? (
            results.map((course: any) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="block bg-white/5 border border-white/10 p-6 rounded-xl hover:scale-[1.02] transition"
              >
                <h2 className="text-xl font-bold text-blue-300">{course.title}</h2>
                <p className="text-sm text-gray-300 mt-1 line-clamp-2">{course.description}</p>
                <p className="text-green-400 mt-2 font-semibold">
                  {course.price === 0 ? 'Free' : `$${course.price}`}
                </p>
              </Link>
            ))
          ) : (
            <p className="text-center col-span-full text-gray-400">No courses found for "{query}"</p>
          )}
        </div>
      )}
    </main>
  );
}
