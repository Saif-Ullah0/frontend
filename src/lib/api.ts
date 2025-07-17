// lib/api.ts

export async function fetchCategories() {
  const res = await fetch('http://localhost:5000/api/categories/public', {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Failed to fetch categories');

  return res.json();
}

export async function fetchCategoryById(id: string) {
  const res = await fetch(`http://localhost:5000/api/categories/${id}`, {
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Failed to fetch category');

  return res.json();
}

// lib/api.ts
// lib/api.ts
export async function fetchCourseById(id: number) {
  try {
    console.log(`🔍 fetchCourseById - Fetching course ID: ${id}`);
    
    const url = `http://localhost:5000/api/courses/${id}`;
    console.log(`📡 Making request to: ${url}`);
    
    const res = await fetch(url, {
      cache: 'no-store',
      credentials: 'include',
    });

    console.log(`📡 Response status: ${res.status}`);
    console.log(`📡 Response ok: ${res.ok}`);
    
    if (!res.ok) {
      console.error(`❌ Failed to fetch course ${id}: ${res.status} ${res.statusText}`);
      const errorText = await res.text();
      console.error('Error response body:', errorText);
      return null;
    }

    const data = await res.json();
    console.log('✅ Raw API response:', data);
    
    // Handle both direct course object and wrapped response
    const course = data.course || data;
    console.log('✅ Processed course data:', course);
    
    if (!course || !course.id) {
      console.error('❌ Invalid course structure:', data);
      return null;
    }

    const result = {
      ...course,
      modules: Array.isArray(course.modules) ? course.modules : [],
    };
    
    console.log('✅ Final course result:', result);
    return result;
    
  } catch (error) {
    console.error('💥 Exception in fetchCourseById:', error);
    return null;
  }
}

export async function fetchCoursesByCategoryId(categoryId: string) {
  const res = await fetch(`http://localhost:5000/api/courses?categoryId=${categoryId}`, {
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Failed to fetch courses');

  return res.json();
}

export async function fetchMyCourses() {
  const res = await fetch('http://localhost:5000/api/enrollments', {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Failed to fetch enrolled courses');
  return res.json();
}
