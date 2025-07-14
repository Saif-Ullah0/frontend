// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Course = {
  id: number;
  title: string;
  description: string;
  price: number;
};

type Enrollment = {
  id: number;
  course: Course;
};

type User = {
  name: string;
  email: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user info
        const userRes = await fetch('http://localhost:5000/api/users/me', {
          credentials: 'include',
        });
        const userData = await userRes.json();
        setUser(userData);

        // Fetch enrolled courses
        const courseRes = await fetch('http://localhost:5000/api/enroll', {
          credentials: 'include',
        });
        const courseData = await courseRes.json();
        setEnrollments(courseData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e1a] text-white">
        Loading dashboard...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e1a] text-white">
        Failed to load user info.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0e1a] px-6 py-16 text-white">
      <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-xl shadow-lg">
        <h1 className="text-4xl font-bold text-blue-400 mb-4">Welcome, {user.name}</h1>
        <p className="text-gray-300 mb-6">Email: {user.email}</p>

        <h2 className="text-2xl font-semibold text-white mb-4">
          Enrolled Courses ({enrollments.length})
        </h2>

        {enrollments.length === 0 ? (
          <p className="text-gray-400">You haven’t enrolled in any courses yet.</p>
        ) : (
          <ul className="space-y-4">
            {enrollments.slice(0, 3).map((enroll) => (
              <li
                key={enroll.id}
                className="bg-gray-800 border border-gray-600 p-4 rounded-lg shadow-md"
              >
                <h3 className="text-xl text-blue-300 font-semibold">{enroll.course.title}</h3>
                <p className="text-gray-400 text-sm">{enroll.course.description.slice(0, 100)}...</p>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => router.push('/my-courses')}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to My Courses
          </button>
          <button
            onClick={() => router.push('/categories')}
            className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
          >
            Browse Courses
          </button>
          <button
            onClick={() => router.push('/profile')}
            className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700"
          >
            Profile
          </button>
        </div>
      </div>
    </main>
  );
}
