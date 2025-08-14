// src/components/comments/CommentThread.tsx
"use client";

import { useState } from 'react';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import { Comment } from './CommentSection';

interface CommentThreadProps {
  comment: Comment;
  onReaction: (commentId: number, reactionType: 'LIKE' | 'DISLIKE') => void;
  onReply: (commentId: number) => void;
  replyingTo: number | null;
  onCommentAdded: (comment: Comment) => void;
  onCommentUpdated: (comment: Comment) => void;
  onCommentDeleted: (commentId: number) => void;
  resourceType: 'VIDEO' | 'NOTE';
  resourceId: number;
  depth?: number;
}

export default function CommentThread({
  comment,
  onReaction,
  onReply,
  replyingTo,
  onCommentAdded,
  onCommentUpdated,
  onCommentDeleted,
  resourceType,
  resourceId,
  depth = 0
}: CommentThreadProps) {
  const [showReplies, setShowReplies] = useState(true);
  
  const isReplyingToThis = replyingTo === comment.id;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const maxDepth = 5; // Limit nesting depth

  return (
    <div className={`${depth > 0 ? 'ml-6 border-l border-white/10 pl-4' : ''}`}>
      {/* Main Comment */}
      <CommentItem
        comment={comment}
        onReaction={onReaction}
        onReply={onReply}
        onUpdate={onCommentUpdated}
        onDelete={onCommentDeleted}
        depth={depth}
      />

      {/* Reply Form */}
      {isReplyingToThis && (
        <div className="mt-4 ml-8">
          <CommentForm
            resourceType={resourceType}
            resourceId={resourceId}
            parentId={comment.id}
            onCommentAdded={onCommentAdded}
            onCancel={() => onReply(-1)} // Use -1 to indicate cancel
            placeholder={`Reply to ${comment.author.name}...`}
            autoFocus={true}
          />
        </div>
      )}

      {/* Replies */}
      {hasReplies && (
        <div className="mt-4">
          {/* Toggle Replies Button */}
          {comment.replies!.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="mb-3 text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
            >
              <span>{showReplies ? '▼' : '▶'}</span>
              {showReplies ? 'Hide' : 'Show'} {comment.replies!.length} {comment.replies!.length === 1 ? 'reply' : 'replies'}
            </button>
          )}

          {/* Replies List */}
          {showReplies && (
            <div className="space-y-4">
              {comment.replies!.map((reply) => (
                <CommentThread
                  key={reply.id}
                  comment={reply}
                  onReaction={onReaction}
                  onReply={depth < maxDepth ? onReply : () => {}} // Disable reply at max depth
                  replyingTo={replyingTo}
                  onCommentAdded={onCommentAdded}
                  onCommentUpdated={onCommentUpdated}
                  onCommentDeleted={onCommentDeleted}
                  resourceType={resourceType}
                  resourceId={resourceId}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}