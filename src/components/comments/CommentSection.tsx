// src/components/comments/CommentSection.tsx
"use client";

import { useEffect, useState } from 'react';
import { 
  ChatBubbleLeftRightIcon,
  PlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import CommentForm from './CommentForm';
import CommentThread from './CommentThread';
import { toast } from 'sonner';

export interface Comment {
  id: number;
  content: string;
  authorId: number;
  author: {
    id: number;
    name: string;
    email: string;
  };
  parentId?: number;
  resourceType: 'VIDEO' | 'NOTE';
  resourceId: number;
  likes: number;
  dislikes: number;
  userReaction?: 'LIKE' | 'DISLIKE' | null;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

interface CommentSectionProps {
  resourceType: 'VIDEO' | 'NOTE';
  resourceId: number;
  className?: string;
}

export default function CommentSection({ resourceType, resourceId, className = "" }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  useEffect(() => {
    fetchComments();
  }, [resourceType, resourceId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `http://localhost:5000/api/comments/${resourceType}/${resourceId}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      
      // Organize comments into tree structure
      const organizedComments = organizeCommentsTree(data);
      setComments(organizedComments);
      
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const organizeCommentsTree = (flatComments: Comment[]): Comment[] => {
    const commentMap = new Map<number, Comment>();
    const rootComments: Comment[] = [];

    // First pass: create map of all comments
    flatComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: organize into tree structure
    flatComments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id);
      if (!commentWithReplies) return;

      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    // Sort by creation date (newest first for root, oldest first for replies)
    rootComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Sort replies chronologically
    const sortReplies = (comment: Comment) => {
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        comment.replies.forEach(sortReplies);
      }
    };
    rootComments.forEach(sortReplies);

    return rootComments;
  };

  const handleCommentAdded = async (newComment: Comment) => {
    // Optimistically update UI
    if (newComment.parentId) {
      // It's a reply
      setComments(prev => {
        const updated = [...prev];
        const addReplyToComment = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment.id === newComment.parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newComment]
              };
            }
            if (comment.replies) {
              return {
                ...comment,
                replies: addReplyToComment(comment.replies)
              };
            }
            return comment;
          });
        };
        return addReplyToComment(updated);
      });
    } else {
      // It's a top-level comment
      setComments(prev => [newComment, ...prev]);
    }
    
    setShowCommentForm(false);
    setReplyingTo(null);
    toast.success('Comment added successfully!');
  };

  const handleCommentUpdated = async (updatedComment: Comment) => {
    setComments(prev => {
      const updateComment = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === updatedComment.id) {
            return { ...updatedComment, replies: comment.replies };
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: updateComment(comment.replies)
            };
          }
          return comment;
        });
      };
      return updateComment(prev);
    });
    toast.success('Comment updated successfully!');
  };

  const handleCommentDeleted = async (commentId: number) => {
    setComments(prev => {
      const deleteComment = (comments: Comment[]): Comment[] => {
        return comments.filter(comment => {
          if (comment.id === commentId) {
            return false;
          }
          if (comment.replies) {
            comment.replies = deleteComment(comment.replies);
          }
          return true;
        });
      };
      return deleteComment(prev);
    });
    toast.success('Comment deleted successfully!');
  };

  const handleReaction = async (commentId: number, reactionType: 'LIKE' | 'DISLIKE') => {
    try {
      const response = await fetch(`http://localhost:5000/api/comments/${commentId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ reactionType }),
      });

      if (!response.ok) {
        throw new Error('Failed to update reaction');
      }

      const data = await response.json();
      
      // Update the comment with new reaction data
      setComments(prev => {
        const updateReaction = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                likes: data.likes,
                dislikes: data.dislikes,
                userReaction: data.userReaction
              };
            }
            if (comment.replies) {
              return {
                ...comment,
                replies: updateReaction(comment.replies)
              };
            }
            return comment;
          });
        };
        return updateReaction(prev);
      });
      
    } catch (error) {
      console.error('Error updating reaction:', error);
      toast.error('Failed to update reaction');
    }
  };

  const totalComments = () => {
    const countComments = (comments: Comment[]): number => {
      return comments.reduce((total, comment) => {
        return total + 1 + (comment.replies ? countComments(comment.replies) : 0);
      }, 0);
    };
    return countComments(comments);
  };

  if (loading) {
    return (
      <div className={`bg-white/5 border border-white/10 rounded-2xl p-6 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          <span className="text-white">Loading comments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/5 border border-white/10 rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">
            Comments ({totalComments()})
          </h3>
        </div>
        
        <button
          onClick={() => setShowCommentForm(!showCommentForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add Comment
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-red-400">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Comment Form */}
      {showCommentForm && (
        <div className="mb-6">
          <CommentForm
            resourceType={resourceType}
            resourceId={resourceId}
            onCommentAdded={handleCommentAdded}
            onCancel={() => setShowCommentForm(false)}
          />
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8">
          <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">No comments yet</p>
          <p className="text-sm text-gray-500">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              onReaction={handleReaction}
              onReply={(commentId) => setReplyingTo(commentId)}
              replyingTo={replyingTo}
              onCommentAdded={handleCommentAdded}
              onCommentUpdated={handleCommentUpdated}
              onCommentDeleted={handleCommentDeleted}
              resourceType={resourceType}
              resourceId={resourceId}
            />
          ))}
        </div>
      )}
    </div>
  );
}