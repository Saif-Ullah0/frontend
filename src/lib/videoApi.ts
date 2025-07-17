// frontend/src/lib/videoApi.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Types
export interface VideoModule {
  id: number;
  title: string;
  content?: string;
  type: string;
  orderIndex: number;
  videoUrl: string;
  videoSize: string;
  videoDuration: number;
  thumbnailUrl?: string;
  courseId: number;
  createdAt: string;
  updatedAt: string;
  course?: {
    id: number;
    title: string;
    slug: string;
  };
}

export interface VideoUploadResponse {
  message: string;
  module: VideoModule;
  metadata?: {
    duration: number;
    size: number;
    bitrate: number;
    format: string;
    video?: {
      codec: string;
      width: number;
      height: number;
      fps: string;
      bitrate: string;
    };
    audio?: {
      codec: string;
      bitrate: string;
      sampleRate: string;
    };
  };
}

export interface VideoListResponse {
  videos: VideoModule[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface VideoStatsResponse {
  stats: {
    totalVideos: number;
    totalDuration: number;
    totalSize: string;
    averageDuration: number;
    formattedTotalDuration: string;
    formattedTotalSize: string;
  };
}

export interface ApiError {
  error: string;
  message: string;
  details?: string[];
}

// Video API class
export class VideoApi {
  private async getAuthHeaders(): Promise<HeadersInit> {
    // Using cookie-based auth like your AdminLayout
    return {
      'Content-Type': 'application/json',
    };
  }

  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      credentials: 'include', // Same as your AdminLayout
      headers: {
        ...headers,
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: 'Network Error',
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.message || error.error);
    }

    return response.json();
  }

  // Upload video with progress tracking
  async uploadVideo(
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<VideoUploadResponse> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            onProgress(progress);
          }
        });
      }

      xhr.onload = () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status === 201) {
            resolve(response);
          } else {
            reject(new Error(response.error || response.message || 'Upload failed'));
          }
        } catch (error) {
          reject(new Error('Invalid response from server'));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error occurred during upload'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Upload timeout'));
      };

      // Set timeout to 15 minutes for large video uploads
      xhr.timeout = 15 * 60 * 1000;

      xhr.open('POST', `${API_BASE_URL}/videos/upload`);
      
      // Use cookie-based auth
      xhr.withCredentials = true;
      
      xhr.send(formData);
    });
  }

  // Get videos for a course
  async getCourseVideos(courseId: number, page = 1, limit = 10): Promise<VideoListResponse> {
    return this.makeRequest<VideoListResponse>(
      `/videos/course/${courseId}?page=${page}&limit=${limit}`
    );
  }

  // Get single video details
  async getVideoById(videoId: number): Promise<{ video: VideoModule }> {
    return this.makeRequest<{ video: VideoModule }>(`/videos/${videoId}`);
  }

  // Update video details
  async updateVideo(
    videoId: number, 
    updateData: Partial<Pick<VideoModule, 'title' | 'content' | 'orderIndex'>>
  ): Promise<{ message: string; module: VideoModule }> {
    return this.makeRequest<{ message: string; module: VideoModule }>(`/videos/${videoId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Delete video
  async deleteVideo(videoId: number): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/videos/${videoId}`, {
      method: 'DELETE',
    });
  }

  // Get video statistics for a course
  async getVideoStats(courseId: number): Promise<VideoStatsResponse> {
    return this.makeRequest<VideoStatsResponse>(`/videos/stats/${courseId}`);
  }

  // Get video stream URL for video player
  getVideoStreamUrl(videoId: number): string {
    return `${API_BASE_URL}/videos/stream/${videoId}`;
  }

  // Get video thumbnail URL
  getVideoThumbnailUrl(thumbnailPath: string): string | null {
    if (!thumbnailPath) return null;
    
    const cleanPath = thumbnailPath.startsWith('/uploads/') 
      ? thumbnailPath.slice(8) 
      : thumbnailPath;
    
    return `${API_BASE_URL.replace('/api', '')}/uploads/${cleanPath}`;
  }

  // Test backend connection
  async testConnection(): Promise<{ message: string; timestamp: string }> {
    return this.makeRequest<{ message: string; timestamp: string }>('/videos/test');
  }
}

// Export singleton instance
export const videoApi = new VideoApi();
export default videoApi;