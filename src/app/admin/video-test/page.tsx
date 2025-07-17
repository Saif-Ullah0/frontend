"use client";

import { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Video, 
  AlertTriangle, 
  CheckCircle,
  RotateCw,
  Play,
  Trash2,
  Edit3,
  Loader
} from 'lucide-react';

// Types (you'll move these to your actual videoApi.ts file)
interface VideoModule {
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

interface Course {
  id: number;
  title: string;
}

interface Message {
  text: string;
  type: 'success' | 'error' | 'info';
}

// Mock VideoApi class (replace with your actual API)
class MockVideoApi {
  private getApiUrl(endpoint: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return `${baseUrl}/api${endpoint}`;
  }

  async testConnection() {
    const response = await fetch(this.getApiUrl('/videos/test'), {
      credentials: 'include'
    });
    return response.json();
  }

  async uploadVideo(formData: FormData, onProgress?: (progress: number) => void) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

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
            reject(new Error(response.error || 'Upload failed'));
          }
        } catch (error) {
          reject(new Error('Invalid response from server'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error'));
      xhr.ontimeout = () => reject(new Error('Upload timeout'));
      xhr.timeout = 15 * 60 * 1000;

      xhr.open('POST', this.getApiUrl('/videos/upload'));
      xhr.withCredentials = true;
      xhr.send(formData);
    });
  }

  async getCourseVideos(courseId: number) {
    const response = await fetch(this.getApiUrl(`/videos/course/${courseId}`), {
      credentials: 'include'
    });
    return response.json();
  }

  async deleteVideo(videoId: number) {
    const response = await fetch(this.getApiUrl(`/videos/${videoId}`), {
      method: 'DELETE',
      credentials: 'include'
    });
    return response.json();
  }

  getVideoStreamUrl(videoId: number): string {
    return this.getApiUrl(`/videos/stream/${videoId}`);
  }

  getVideoThumbnailUrl(thumbnailPath: string): string | null {
    if (!thumbnailPath) return null;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const cleanPath = thumbnailPath.startsWith('/uploads/') 
      ? thumbnailPath.slice(8) 
      : thumbnailPath;
    return `${baseUrl}/uploads/${cleanPath}`;
  }
}

const videoApi = new MockVideoApi();

export default function VideoTestPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState<Message | null>(null);
  const [videos, setVideos] = useState<VideoModule[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('1');
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock courses - replace with actual course data from your API
  const courses: Course[] = [
    { id: 1, title: 'React Fundamentals' },
    { id: 2, title: 'Node.js Backend' },
    { id: 3, title: 'Full Stack Development' }
  ];

  const showMessage = (text: string, type: Message['type'] = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  // Test backend connection
  const testConnection = async () => {
    try {
      const response = await videoApi.testConnection();
      showMessage(`Backend connected: ${response.message}`, 'success');
    } catch (error) {
      showMessage(`Backend connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  // Upload video
  const handleUpload = async () => {
    const videoFile = fileInputRef.current?.files?.[0];
    const thumbnailFile = (document.getElementById('thumbnail') as HTMLInputElement)?.files?.[0];
    const title = (document.getElementById('title') as HTMLInputElement)?.value;
    const content = (document.getElementById('content') as HTMLTextAreaElement)?.value;
    
    if (!videoFile) {
      showMessage('Please select a video file', 'error');
      return;
    }

    if (!title?.trim()) {
      showMessage('Please enter a video title', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('title', title);
      formData.append('courseId', selectedCourse);
      formData.append('content', content || '');
      
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      await videoApi.uploadVideo(formData, (progress) => {
        setUploadProgress(progress);
      });

      showMessage(`Video uploaded successfully: ${title}`, 'success');
      
      // Reset form inputs
      (document.getElementById('title') as HTMLInputElement).value = '';
      (document.getElementById('content') as HTMLTextAreaElement).value = '';
      if (fileInputRef.current) fileInputRef.current.value = '';
      (document.getElementById('thumbnail') as HTMLInputElement).value = '';
      
      await loadVideos(); // Refresh video list

    } catch (error) {
      showMessage(`Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Load videos for selected course
  const loadVideos = async () => {
    setLoading(true);
    try {
      const response = await videoApi.getCourseVideos(parseInt(selectedCourse));
      setVideos(response.videos || []);
      showMessage(`Loaded ${response.videos?.length || 0} videos`, 'success');
    } catch (error) {
      showMessage(`Failed to load videos: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete video
  const handleDeleteVideo = async (videoId: number, videoTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${videoTitle}"?`)) return;

    try {
      await videoApi.deleteVideo(videoId);
      showMessage(`Video "${videoTitle}" deleted successfully`, 'success');
      await loadVideos(); // Refresh video list
    } catch (error) {
      showMessage(`Failed to delete video: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const formatFileSize = (bytes: string): string => {
    const num = parseInt(bytes);
    if (!num) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(num) / Math.log(k));
    return parseFloat((num / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    loadVideos();
  }, [selectedCourse]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 shadow-xl">
          <h1 className="text-3xl font-bold text-white mb-2">Video Management Test</h1>
          <p className="text-gray-300">Test video upload and management functionality</p>
        </div>

        {/* Connection Test */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-4">Backend Connection</h2>
          <button
            onClick={testConnection}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Video className="w-5 h-5 mr-2" />
            Test Backend Connection
          </button>
        </div>

        {/* Upload Section */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-6">Upload Video</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full p-3 bg-white bg-opacity-20 backdrop-blur-sm border border-gray-300 border-opacity-30 rounded-lg text-white"
              >
                {courses.map(course => (
                  <option key={course.id} value={course.id} className="text-gray-900">
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Video Title</label>
              <input
                id="title"
                type="text"
                placeholder="Enter video title"
                className="w-full p-3 bg-white bg-opacity-20 backdrop-blur-sm border border-gray-300 border-opacity-30 rounded-lg text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                id="content"
                placeholder="Enter video description"
                rows={3}
                className="w-full p-3 bg-white bg-opacity-20 backdrop-blur-sm border border-gray-300 border-opacity-30 rounded-lg text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Video File</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="w-full p-3 bg-white bg-opacity-20 backdrop-blur-sm border border-gray-300 border-opacity-30 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Thumbnail (Optional)</label>
              <input
                id="thumbnail"
                type="file"
                accept="image/*"
                className="w-full p-3 bg-white bg-opacity-20 backdrop-blur-sm border border-gray-300 border-opacity-30 rounded-lg text-white"
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white rounded-lg transition-colors font-medium"
            >
              {isUploading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Uploading... {uploadProgress}%
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Video
                </>
              )}
            </button>

            {isUploading && (
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-4 rounded-xl flex items-center backdrop-blur-lg ${
            message.type === 'success' ? 'bg-green-500 bg-opacity-20 text-green-300' :
            message.type === 'error' ? 'bg-red-500 bg-opacity-20 text-red-300' :
            'bg-blue-500 bg-opacity-20 text-blue-300'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> :
             message.type === 'error' ? <AlertTriangle className="w-5 h-5 mr-2" /> :
             <Video className="w-5 h-5 mr-2" />}
            {message.text}
          </div>
        )}

        {/* Videos List */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl shadow-xl">
          <div className="p-6 border-b border-gray-300 border-opacity-20">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Course Videos</h2>
              <button
                onClick={loadVideos}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 text-white rounded-lg transition-colors"
              >
                <RotateCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Loading...' : 'Refresh Videos'}
              </button>
            </div>
          </div>

          <div className="p-6">
            {videos.length === 0 ? (
              <div className="text-center py-12">
                <Video className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-400 text-lg">No videos uploaded yet</p>
                <p className="text-gray-500 text-sm">Upload your first video to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {videos.map((video) => (
                  <div key={video.id} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 hover:bg-opacity-15 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-16 h-12 bg-gray-700 rounded flex items-center justify-center">
                          {video.thumbnailUrl ? (
                            <img
                              src={videoApi.getVideoThumbnailUrl(video.thumbnailUrl) || ''}
                              alt="Thumbnail"
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <Video className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{video.title}</h3>
                          <p className="text-gray-300 text-sm mt-1">{video.content}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                            <span>Duration: {formatDuration(video.videoDuration)}</span>
                            <span>Size: {formatFileSize(video.videoSize)}</span>
                            <span>Order: {video.orderIndex}</span>
                            <span>
                              Uploaded: {new Date(video.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a
                          href={videoApi.getVideoStreamUrl(video.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500 hover:bg-opacity-20 rounded transition-colors"
                          title="View Video"
                        >
                          <Play className="w-4 h-4" />
                        </a>
                        <button
                          className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500 hover:bg-opacity-20 rounded transition-colors"
                          title="Edit Video"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVideo(video.id, video.title)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500 hover:bg-opacity-20 rounded transition-colors"
                          title="Delete Video"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}