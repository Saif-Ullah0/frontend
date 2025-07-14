// /components/MyCoursesClient.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Course = {
  id: number;
  title: string;
  description: string;
  price: number;
  category: {
    id: number;
    name: string;
  };
};

type Enrollment = {
  id: number;
  course: Course;
};

export default function MyCoursesClient() {
  const [courses, setCourses] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/enroll', {
          credentials: 'include',
        });

        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e1a] text-white">
        Loading your courses...
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0e1a] text-white">
        <h2 className="text-2xl mb-4">You haven’t enrolled in any courses yet</h2>
        <button
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => router.push('/categories')}
        >
          Browse Courses
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0e1a] px-8 py-16 text-white">
      <h1 className="text-4xl font-bold text-blue-400 mb-10 text-center">My Courses</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {courses.map((enrollment) => (
          <div
            key={enrollment.id}
            className="cursor-pointer bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl shadow-lg transition-transform hover:scale-105"
            onClick={() => router.push(`/courses/${enrollment.course.id}/modules`)}
          >
            <h2 className="text-2xl text-blue-300 font-semibold mb-2">{enrollment.course.title}</h2>
            <p className="text-gray-300 text-sm mb-2">{enrollment.course.category?.name}</p>
            <p className="text-gray-400 text-sm mb-4">
              {enrollment.course.description.slice(0, 80)}...
            </p>
            <span className="text-green-400 font-semibold">
              {enrollment.course.price === 0 ? 'Free' : `$${enrollment.course.price}`}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}
