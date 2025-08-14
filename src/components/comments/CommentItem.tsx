// src/components/comments/CommentItem.tsx
"use client";

import { useState } from 'react';
import { 
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  HandThumbUpIcon as HandThumbUpSolidIcon,
  HandThumbDownIcon as HandThumbDownSolidIcon
} from '@heroicons/react/24/solid';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Comment } from './CommentSection';

interface CommentItemProps {
  comment: Comment;
  onReaction: (commentId: number, reactionType: 'LIKE' | 'DISLIKE') => void;
  onReply: (commentId: number) => void;
  onUpdate: (comment: Comment) => void;
  onDelete: (commentId: number) => void;
  depth: number;
}

export default function CommentItem({
  comment,
  onReaction,
  onReply,
  onUpdate,
  onDelete,
  depth
}: CommentItemProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [loading, setLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const isAuthor = user?.id === comment.authorId;
  const canReply = depth < 5; // Limit reply depth

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  const handleReaction = (reactionType: 'LIKE' | 'DISLIKE') => {
    if (!user) {
      toast.error('Please login to react to comments');
      return;
    }
    onReaction(comment.id, reactionType);
  };

  const handleEdit = async () => {
    if (!editContent.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/comments/${comment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: editContent.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update comment');
      }

      const updatedComment = await response.json();
      onUpdate(updatedComment);
      setIsEditing(false);
      
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/comments/${comment.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete comment');
      }

      onDelete(comment.id);
      
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete comment');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
      {/* Comment Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* User Avatar */}
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {comment.author.name.charAt(0).toUpperCase()}
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">{comment.author.name}</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
              {comment.updatedAt !== comment.createdAt && (
                <>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-500">edited</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        {isAuthor && (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <EllipsisHorizontalIcon className="w-4 h-4" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-6 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 min-w-[100px]">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <PencilIcon className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    handleDelete();
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
                  disabled={loading}
                >
                  <TrashIcon className="w-3 h-3" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comment Content */}
      {isEditing ? (
        <div className="mb-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
            rows={3}
            disabled={loading}
          />
          <div className="flex items-center justify-end gap-2 mt-2">
            <button
              onClick={cancelEdit}
              className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              disabled={loading || !editContent.trim()}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <CheckIcon className="w-3 h-3" />
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>
      )}

      {/* Comment Actions */}
      {!isEditing && (
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button
            onClick={() => handleReaction('LIKE')}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              comment.userReaction === 'LIKE'
                ? 'text-blue-400 bg-blue-500/20'
                : 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10'
            }`}
            disabled={!user}
          >
            {comment.userReaction === 'LIKE' ? (
              <HandThumbUpSolidIcon className="w-4 h-4" />
            ) : (
              <HandThumbUpIcon className="w-4 h-4" />
            )}
            <span className="text-sm">{comment.likes || 0}</span>
          </button>

          {/* Dislike Button */}
          <button
            onClick={() => handleReaction('DISLIKE')}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              comment.userReaction === 'DISLIKE'
                ? 'text-red-400 bg-red-500/20'
                : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
            }`}
            disabled={!user}
          >
            {comment.userReaction === 'DISLIKE' ? (
              <HandThumbDownSolidIcon className="w-4 h-4" />
            ) : (
              <HandThumbDownIcon className="w-4 h-4" />
            )}
            <span className="text-sm">{comment.dislikes || 0}</span>
          </button>

          {/* Reply Button */}
          {canReply && user && (
            <button
              onClick={() => onReply(comment.id)}
              className="flex items-center gap-1 px-2 py-1 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
            >
              <ChatBubbleLeftIcon className="w-4 h-4" />
              <span className="text-sm">Reply</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}