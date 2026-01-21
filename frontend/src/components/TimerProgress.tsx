'use client';

import { memo } from 'react';

interface TimerProgressProps {
  deadline: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TimerProgress = memo(function TimerProgress({
  deadline,
  label,
  size = 'md'
}: TimerProgressProps) {
  // Calculate time remaining once at render - NO state updates, NO re-renders
  const currentTime = Math.floor(Date.now() / 1000);
  const timeRemaining = Math.max(0, deadline - currentTime);
  const totalDuration = Math.max(timeRemaining, 3600);

  const progress = totalDuration > 0 ? (timeRemaining / totalDuration) * 100 : 0;
  const isUrgent = timeRemaining < 300;
  const isExpired = timeRemaining <= 0;

  const progressColor = isExpired ? 'bg-destructive' : isUrgent ? 'bg-amber-500' : 'bg-accent';
  const sizeClasses = size === 'sm' ? 'h-1' : size === 'lg' ? 'h-3' : 'h-2';

  // Format time - calculated once per render
  let formattedTime: string;
  if (timeRemaining <= 0) {
    formattedTime = 'Deadline passed';
  } else {
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);

    if (hours > 0) {
      formattedTime = `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      formattedTime = `${minutes}m`;
    } else {
      formattedTime = '< 1m';
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-white">{label}</span>
        <span className={`text-sm font-semibold ${isExpired ? 'text-destructive' : isUrgent ? 'text-amber-500' : 'text-white'}`}>
          {formattedTime}
        </span>
      </div>

      <div className="w-full bg-muted rounded-full overflow-hidden">
        <div
          className={`${progressColor} ${sizeClasses} transition-all duration-300 rounded-full`}
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>
    </div>
  );
});
