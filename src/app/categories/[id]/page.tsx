'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/categories/${id}`);
        if (!res.ok) throw new Error('Category not found');
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
      <div className="min-h-screen flex items-center justify-center text-white bg-[#0b0e1a]">
        Loading category...
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white bg-[#0b0e1a]">
        <h1 className="text-3xl font-bold text-red-500">404 - Category Not Found</h1>
        <p className="text-gray-300 mt-4">Please check the URL or go back to categories page.</p>
        <button
          onClick={() => router.push('/categories')}
          className="mt-6 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          Go Back to Categories
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0e1a] text-white px-6 py-20">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-400 mb-2">{category.name}</h1>
        <p className="text-gray-300 mb-10">{category.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {category.courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="block bg-white/5 border border-white/10 p-6 rounded-xl shadow hover:shadow-lg transition hover:scale-[1.02]"
            >
              <h2 className="text-xl font-semibold text-blue-300">{course.title}</h2>
              <p className="text-gray-400 text-sm mt-1">{course.description}</p>
              <p className="text-green-400 mt-2 font-bold">
                {course.price === 0 ? 'Free' : `$${course.price}`}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
