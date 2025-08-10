// components/accessibility/LiveRegion.tsx
'use client';

import { useEffect, useRef } from 'react';

interface LiveRegionProps {
  message: string;
  priority?: 'polite' | 'assertive';
  clearAfter?: number;
}

export function LiveRegion({ message, priority = 'polite', clearAfter = 5000 }: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (regionRef.current && message) {
      regionRef.current.textContent = message;
      
      if (clearAfter > 0) {
        const timer = setTimeout(() => {
          if (regionRef.current) {
            regionRef.current.textContent = '';
          }
        }, clearAfter);
        
        return () => clearTimeout(timer);
      }
    }
  }, [message, clearAfter]);

  return (
    <div
      ref={regionRef}
      className="sr-only"
      aria-live={priority}
      aria-atomic="true"
    />
  );
}