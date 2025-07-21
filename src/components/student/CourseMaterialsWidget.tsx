// frontend/src/components/student/CourseMaterialsWidget.tsx
"use client";

import { useEffect, useState } from 'react';
import { DocumentIcon, BookOpenIcon } from '@heroicons/react/24/outline';

interface Note {
  id: number;
  title: string;
  fileType?: string;
}

interface CourseMaterialsWidgetProps {
  courseId: number;
}

export default function CourseMaterialsWidget({ courseId }: CourseMaterialsWidgetProps) {
  const [notesCount, setNotesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotesCount();
  }, [courseId]);

  const fetchNotesCount = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/notes/course/${courseId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const notes = await response.json();
        setNotesCount(notes.length);
      }
    } catch (error) {
      console.error('Error fetching notes count:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-xs text-gray-400">
        <span>Loading materials...</span>
      </div>
    );
  }

  if (notesCount === 0) {
    return null; // Don't show if no materials
  }

  return (
    <div className="flex items-center gap-1 text-xs text-gray-400">
      <DocumentIcon className="w-3 h-3" />
      <span>{notesCount} material{notesCount !== 1 ? 's' : ''}</span>
    </div>
  );
}