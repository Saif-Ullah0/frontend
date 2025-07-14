// app/courses/[id]/page.tsx
export const dynamic = 'force-dynamic'; // ✅ Required for runtime dynamic fetch

import { fetchCourseById } from '@/lib/api';
import { notFound } from 'next/navigation';
import CourseDetail from '@/components/CourseDetail';

export default async function CourseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const idString = params?.id;
  const courseId = parseInt(idString);

  if (!idString || isNaN(courseId)) return notFound();

  const course = await fetchCourseById(courseId);
  if (!course || !Array.isArray(course.modules)) return notFound();

  return <CourseDetail course={course} />;
}
