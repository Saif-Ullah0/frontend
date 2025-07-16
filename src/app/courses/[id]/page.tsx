// app/courses/[id]/page.tsx
import { fetchCourseById } from '@/lib/api';
import { notFound } from 'next/navigation';
import CourseDetail from '@/components/CourseDetail';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type Props = {
  params: { id: string };
};

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const courseId = parseInt(params.id);
  
  if (isNaN(courseId)) {
    return {
      title: 'Course Not Found',
      description: 'The course you are looking for does not exist.'
    };
  }

  try {
    const course = await fetchCourseById(courseId);
    
    if (!course) {
      return {
        title: 'Course Not Found',
        description: 'The course you are looking for does not exist.'
      };
    }

    return {
      title: `${course.title} | Learning Platform`,
      description: course.description,
      keywords: [course.title, course.category?.name, 'online course', 'learning', 'education'].filter(Boolean).join(', '),
      openGraph: {
        title: course.title,
        description: course.description,
        type: 'website',
        images: course.imageUrl ? [course.imageUrl] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: course.title,
        description: course.description,
        images: course.imageUrl ? [course.imageUrl] : undefined,
      }
    };
  } catch (error) {
    return {
      title: 'Course Not Found',
      description: 'The course you are looking for does not exist.'
    };
  }
}

export default async function CourseDetailPage({ params }: Props) {
  const { id } = params;
  const courseId = parseInt(id);

  // Validate course ID
  if (!id || isNaN(courseId)) {
    notFound();
  }

  try {
    // Fetch course data
    const course = await fetchCourseById(courseId);
    
    // Check if course exists and has required data
    if (!course) {
      notFound();
    }

    // Ensure modules is an array (fallback to empty array if not)
    const enhancedCourse = {
      ...course,
      modules: Array.isArray(course.modules) ? course.modules : [],
      // Add any other data transformations needed
      imageUrl: course.imageUrl || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop&crop=center`,
    };

    return <CourseDetail course={enhancedCourse} />;
    
  } catch (error) {
    console.error('Error fetching course:', error);
    notFound();
  }
}