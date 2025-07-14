// app/categories/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Course = {
  id: number;
  title: string;
  description: string;
  price: number;
};

type Category = {
  id: number;
  name: string;
  description: string;
  courses: Course[];
};

export default function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/categories/${id}`);
        if (!res.ok) {
          throw new Error('Category not found');
        }

        const data = await res.json();
        setCategory(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCategory();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white bg-[#0b0e1a]">
        Loading category...
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-400 bg-[#0b0e1a] text-center px-4">
        <h2 className="text-3xl font-bold">404 - Category Not Found</h2>
        <p className="text-gray-300 mt-2">Please check the URL or go back to categories page.</p>
        <button
          onClick={() => router.push('/categories')}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Categories
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-6 py-12 bg-[#0b0e1a] text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-400 mb-2">{category.name}</h1>
        <p className="text-gray-300 mb-8">{category.description}</p>

        {category.courses.length === 0 ? (
          <p className="text-gray-400">No courses available in this category.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {category.courses.map((course) => (
              <div
                key={course.id}
                className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl shadow-lg hover:scale-105 transition-transform"
              >
                <h2 className="text-xl font-semibold text-blue-300 mb-2">{course.title}</h2>
                <p className="text-gray-400 text-sm mb-3">{course.description.slice(0, 80)}...</p>
                <p className="text-green-400 font-bold">
                  {course.price === 0 ? 'Free' : `$${course.price}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
