import { fetchCourseById } from '@/lib/api';
import { notFound } from 'next/navigation';

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


//type Props = { params: { id: string } };

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const courseId = parseInt(params.id);
  if (isNaN(courseId)) return notFound();

  const course: Course = await fetchCourseById(courseId); // 👈 use typed result

  if (!course) return notFound();

  return (
    <main className="relative min-h-screen bg-[#0b0e1a] text-white px-6 py-20 overflow-hidden">
      {/* Background lighting */}
      <div className="absolute top-[-80px] left-[-100px] w-[400px] h-[400px] bg-pink-500/20 rounded-full blur-[160px] animate-pulse-slow z-0" />
      <div className="absolute bottom-[-100px] right-[-80px] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[140px] animate-pulse-slower z-0" />

      <div className="relative z-10 max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-xl shadow-lg">
        <h1 className="text-4xl font-bold text-blue-400 mb-4">{course.title}</h1>
        <p className="text-gray-300 text-lg mb-8">{course.description}</p>

        <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white mb-3">Modules</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-200">
          {course.modules.map((mod: Module) => (
            <li key={mod.id}>{mod.title}</li>
            ))}
          </ul>
        </div>

        <div className="flex justify-between items-center mt-10">
          <span className="text-2xl font-bold text-green-400">${course.price}</span>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-all">
            Enroll Now
          </button>
        </div>
      </div>
    </main>
  );
}
