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

export async function fetchCourseById(id: number) {
  const res = await fetch(`http://localhost:5000/api/courses/${id}`, {
    cache: 'no-store', // Prevent caching
    credentials: 'include',
  });

  if (!res.ok) return null;

  const data = await res.json();

  return {
    ...data,
    modules: Array.isArray(data.modules) ? data.modules : [],
  };
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
