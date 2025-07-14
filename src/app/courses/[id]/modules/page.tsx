// app/courses/[id]/modules/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Module = {
  id: number;
  title: string;
};

export default function CourseModulesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [notEnrolled, setNotEnrolled] = useState(false);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/enroll/modules/${id}`, {
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          setModules(data);
        } else {
          setNotEnrolled(true);
        }
      } catch (err) {
        console.error('Failed to fetch modules:', err);
        setNotEnrolled(true);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e1a] text-white">
        Loading modules...
      </div>
    );
  }

  if (notEnrolled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0e1a] text-white text-center px-4">
        <h2 className="text-3xl font-bold mb-4 text-red-400">Access Denied</h2>
        <p className="text-lg text-gray-300 mb-6">You must be enrolled in this course to view the content.</p>
        <button
          onClick={() => router.push('/my-courses')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Go to My Courses
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0e1a] px-6 py-20 text-white">
      <div className="max-w-3xl mx-auto bg-white/5 border border-white/10 p-10 rounded-3xl backdrop-blur-xl shadow-lg">
        <h1 className="text-4xl font-bold text-blue-400 mb-6">Course Modules</h1>
        {modules.length === 0 ? (
  <div className="text-center text-gray-400 text-lg">
    This course doesn’t have any modules yet.
  </div>
) : (
  <ul className="space-y-4">
    {modules.map((mod) => (
      <li
        key={mod.id}
        className="bg-gray-800 border border-gray-600 p-4 rounded-lg shadow-md"
      >
        {mod.title}
      </li>
    ))}
  </ul>
)}

      </div>
    </main>
  );
}
