
import React from 'react';

interface NotificationBubbleProps {
  count: number;
  className?: string;
}

export const NotificationBubble: React.FC<NotificationBubbleProps> = ({ count, className }) => {
  if (count <= 0) return null;

  return (
    <span
      className={`absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full ${className || ''}`}
    >
      {count}
    </span>
  );
};
