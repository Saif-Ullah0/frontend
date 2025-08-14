// src/components/comments/CommentForm.tsx
"use client";

import { useState } from 'react';
import { 
  PaperAirplaneIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { Comment } from './CommentSection';

interface CommentFormProps {
  resourceType: 'VIDEO' | 'NOTE';
  resourceId: number;
  parentId?: number;
  onCommentAdded: (comment: Comment) => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function CommentForm({ 
  resourceType, 
  resourceId, 
  parentId,
  onCommentAdded,
  onCancel,
  placeholder = "Share your thoughts...",
  autoFocus = false
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: content.trim(),
          resourceType,
          resourceId,
          parentId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post comment');
      }

      const newComment = await response.json();
      onCommentAdded(newComment);
      setContent('');
      
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          rows={parentId ? 2 : 3}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
          disabled={loading}
        />
        
        {/* Character count */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-500">
          {content.length}/1000
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          {parentId ? 'Replying to comment' : 'Share your thoughts about this content'}
        </div>
        
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            disabled={loading || !content.trim() || content.length > 1000}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Posting...
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="w-4 h-4" />
                {parentId ? 'Reply' : 'Comment'}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}