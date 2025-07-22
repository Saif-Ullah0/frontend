// lib/api.ts - Enhanced with module payment functionality

// ================================
// EXISTING FUNCTIONS (Enhanced)
// ================================

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

// Enhanced fetchCourseById with module payment support
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

    // Enhanced processing with module payment fields
    const result = {
      ...course,
      modules: Array.isArray(course.modules) ? course.modules.map((module: any) => ({
        ...module,
        // Ensure payment fields are present with defaults
        price: module.price || 0,
        isFree: module.isFree || module.price === 0,
        isPublished: module.isPublished !== false, // Default to true if not specified
        isPreview: module.isPreview || false,
        order: module.orderIndex || module.order || 0
      })) : [],
    };
    
    console.log('✅ Final course result with payment fields:', result);
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

// ================================
// NEW MODULE PAYMENT FUNCTIONS
// ================================

// Get individual module details with ownership info
export async function fetchModuleDetails(moduleId: number) {
  try {
    console.log(`🔍 Fetching module details for ID: ${moduleId}`);
    
    const response = await fetch(`http://localhost:5000/api/payment/modules/${moduleId}`, {
      credentials: 'include',
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error(`❌ Failed to fetch module ${moduleId}: ${response.status}`);
      throw new Error(`Failed to fetch module: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Module ${moduleId} details:`, data);
    return data;
  } catch (error) {
    console.error('Error fetching module details:', error);
    throw error;
  }
}

// Check ownership status for multiple modules
export async function fetchModuleOwnership(moduleIds: number[]) {
  try {
    console.log(`🔍 Checking ownership for modules:`, moduleIds);
    
    const ownership: { [key: number]: boolean } = {};
    
    // Check ownership for each module in parallel
    const results = await Promise.allSettled(
      moduleIds.map(async (moduleId) => {
        try {
          const response = await fetch(`http://localhost:5000/api/payment/modules/${moduleId}`, {
            credentials: 'include',
            cache: 'no-store'
          });
          
          if (response.ok) {
            const data = await response.json();
            return { moduleId, isOwned: data.isOwned || false };
          } else {
            return { moduleId, isOwned: false };
          }
        } catch {
          return { moduleId, isOwned: false };
        }
      })
    );
    
    // Process results
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        ownership[result.value.moduleId] = result.value.isOwned;
      }
    });
    
    console.log(`✅ Module ownership results:`, ownership);
    return ownership;
  } catch (error) {
    console.error('Error fetching module ownership:', error);
    return {};
  }
}

// Purchase individual module
export async function purchaseModule(moduleId: number) {
  try {
    console.log(`💳 Purchasing module ${moduleId}...`);
    
    const response = await fetch('http://localhost:5000/api/payment/modules/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleId }),
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Purchase failed');
    }

    console.log(`✅ Module ${moduleId} purchase successful:`, data);
    return data;
  } catch (error) {
    console.error(`❌ Module ${moduleId} purchase failed:`, error);
    throw error;
  }
}

// Get user's purchased modules
export async function fetchUserModules() {
  try {
    console.log(`🔍 Fetching user's purchased modules...`);
    
    const response = await fetch('http://localhost:5000/api/payment/modules/my-modules', {
      credentials: 'include',
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user modules: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ User modules loaded:`, data);
    return data;
  } catch (error) {
    console.error('Error fetching user modules:', error);
    throw error;
  }
}

// ================================
// BUNDLE MANAGEMENT FUNCTIONS
// ================================

// Get user's bundles
export async function fetchUserBundles() {
  try {
    console.log(`🔍 Fetching user's bundles...`);
    
    const response = await fetch('http://localhost:5000/api/payment/bundles', {
      credentials: 'include',
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bundles: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ User bundles loaded:`, data);
    return data;
  } catch (error) {
    console.error('Error fetching user bundles:', error);
    throw error;
  }
}

// Create new bundle
export async function createBundle(bundleData: {
  name: string;
  description?: string;
  moduleIds: number[];
  discount?: number;
}) {
  try {
    console.log(`🔍 Creating bundle:`, bundleData);
    
    const response = await fetch('http://localhost:5000/api/payment/bundles/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bundleData),
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create bundle');
    }

    console.log(`✅ Bundle created successfully:`, data);
    return data;
  } catch (error) {
    console.error('Error creating bundle:', error);
    throw error;
  }
}

// Purchase bundle
export async function purchaseBundle(bundleId: number) {
  try {
    console.log(`💳 Purchasing bundle ${bundleId}...`);
    
    const response = await fetch('http://localhost:5000/api/payment/bundles/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bundleId }),
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Bundle purchase failed');
    }

    console.log(`✅ Bundle ${bundleId} purchase successful:`, data);
    return data;
  } catch (error) {
    console.error(`❌ Bundle ${bundleId} purchase failed:`, error);
    throw error;
  }
}

// Delete bundle
export async function deleteBundle(bundleId: number) {
  try {
    console.log(`🗑️ Deleting bundle ${bundleId}...`);
    
    const response = await fetch(`http://localhost:5000/api/payment/bundles/${bundleId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete bundle');
    }

    const data = await response.json();
    console.log(`✅ Bundle ${bundleId} deleted successfully:`, data);
    return data;
  } catch (error) {
    console.error(`❌ Bundle ${bundleId} deletion failed:`, error);
    throw error;
  }
}

// ================================
// PAYMENT HEALTH CHECK
// ================================

// Check payment system health
export async function checkPaymentHealth() {
  try {
    const response = await fetch('http://localhost:5000/api/payment/health', {
      credentials: 'include'
    });

    const data = await response.json();
    console.log('💊 Payment health check:', data);
    return data;
  } catch (error) {
    console.error('❌ Payment health check failed:', error);
    return { stripe: 'error', error: error.message };
  }
}

// ================================
// UTILITY FUNCTIONS
// ================================

// Helper to check if a course has paid modules
export function courseHasPaidModules(course: any): boolean {
  return course.modules?.some((module: any) => 
    module.price > 0 && !module.isFree
  ) || false;
}

// Helper to calculate total module price
export function calculateTotalModulePrice(modules: any[]): number {
  return modules?.reduce((total, module) => {
    return total + (module.price || 0);
  }, 0) || 0;
}

// Helper to get module pricing stats
export function getModulePricingStats(modules: any[]) {
  const paidModules = modules?.filter(m => m.price > 0 && !m.isFree) || [];
  const freeModules = modules?.filter(m => !m.price || m.price === 0 || m.isFree) || [];
  const totalPrice = calculateTotalModulePrice(paidModules);
  
  return {
    totalModules: modules?.length || 0,
    paidModules: paidModules.length,
    freeModules: freeModules.length,
    totalPrice,
    minPrice: paidModules.length > 0 ? Math.min(...paidModules.map(m => m.price)) : 0,
    maxPrice: paidModules.length > 0 ? Math.max(...paidModules.map(m => m.price)) : 0
  };
}