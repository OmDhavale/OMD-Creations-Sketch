import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const StatusBadge = ({ status }) => {
  const statusConfig = {
    concept: { label: 'Concept', color: 'bg-muted text-white' },
    awaiting_advance: { label: 'Awaiting Advance', color: 'bg-yellow-600/20 text-yellow-500 border-yellow-600/50' },
    sketch_preview: { label: 'Sketch Preview', color: 'bg-blue-600/20 text-blue-400 border-blue-600/50' },
    awaiting_final_payment: { label: 'Awaiting Final', color: 'bg-orange-600/20 text-orange-500 border-orange-600/50' },
    completed: { label: 'Completed', color: 'bg-accent/20 text-accent border-accent/50' },
  };

  const config = statusConfig[status] || statusConfig.concept;

  return (
    <span className={cn(
      "px-2 py-1 text-xs font-semibold rounded-full border",
      config.color
    )}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
