'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Module = {
  id: number;
  title: string;
};

type Course = {
  id: number;
  title: string;
  description: string;
  price: number;
  modules: Module[];
};

export default function CourseDetail({ course }: { course: Course }) {
  const [loading, setLoading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkEnrollment = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/enroll', {
          credentials: 'include',
        });
        const data = await res.json();
        type Enrollment = { courseId: number };
        const enrolled = data.some((enr: Enrollment) => enr.courseId === course.id);
        setIsEnrolled(enrolled);
      } catch (err) {
        console.error('Enrollment check failed:', err);
      } finally {
        setCheckingEnrollment(false);
      }
    };
    checkEnrollment();
  }, [course.id]);

  const handleEnroll = async () => {
    setLoading(true);

    try {
      if (course.price === 0) {
        const res = await fetch('http://localhost:5000/api/enroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ courseId: course.id }),
        });

        const data = await res.json();

        if (res.ok) {
          router.push('/my-courses');
        } else {
          alert(data.error || 'Enrollment failed');
        }
      } else {
        const res = await fetch('http://localhost:5000/api/payment/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ courseId: course.id }),
        });

        const data = await res.json();

        if (res.ok && data.url) {
          window.location.href = data.url;
        } else {
          alert(data.error || 'Stripe checkout failed');
        }
      }
    } catch (err) {
      console.error('Enroll error:', err);
      alert('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingEnrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Checking enrollment...
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#0b0e1a] text-white px-6 py-20 overflow-hidden">
      <div className="absolute top-[-80px] left-[-100px] w-[400px] h-[400px] bg-pink-500/20 rounded-full blur-[160px] animate-pulse-slow z-0" />
      <div className="absolute bottom-[-100px] right-[-80px] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[140px] animate-pulse-slower z-0" />

      <div className="relative z-10 max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-xl shadow-lg">
        <h1 className="text-4xl font-bold text-blue-400 mb-4">{course.title}</h1>
        <p className="text-gray-300 text-lg mb-8">{course.description}</p>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white mb-3">Modules</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-200">
            {course.modules.map((mod) => (
              <li key={mod.id}>{mod.title}</li>
            ))}
          </ul>
        </div>

        <div className="flex justify-between items-center mt-10">
          <span className="text-2xl font-bold text-green-400">
            {course.price === 0 ? 'Free' : `$${course.price}`}
          </span>
          {isEnrolled ? (
            <button
              onClick={() => router.push(`/courses/${course.id}/modules`)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg"
            >
              Go to Modules
            </button>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Processing…' : 'Enroll Now'}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
