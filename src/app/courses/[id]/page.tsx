import { fetchCourseById } from '@/lib/api';
import { notFound } from 'next/navigation';
import CourseDetail from '@/components/CourseDetail';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>; // 🆕 FIXED: params is Promise
};

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params; // 🆕 FIXED: await params
  const courseId = parseInt(id);
  
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
  const { id } = await params; // 🆕 FIXED: await params
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

    // 🆕 UPDATED: Transform Chapter-based data to work with existing component
    const enhancedCourse = {
      ...course,
      modules: Array.isArray(course.modules) ? course.modules.map(module => ({
        ...module,
        // 🆕 NEW: Flatten chapter data for backward compatibility
        chapters: module.chapters || [],
        // Keep existing module properties
        description: module.chapters?.[0]?.description || `Learn about ${module.title}`,
        duration: module.chapters?.reduce((total, chapter) => total + (chapter.videoDuration || 0), 0) || 15,
        isPreview: module.chapters?.some(chapter => chapter.publishStatus === 'PUBLISHED') || false,
      })) : [],
      imageUrl: course.imageUrl || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop&crop=center`,
    };

    return <CourseDetail course={enhancedCourse} />;
    
  } catch (error) {
    console.error('Error fetching course:', error);
    notFound();
  }
}