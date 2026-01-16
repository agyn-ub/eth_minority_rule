'use client';

import { useState, useEffect } from 'react';

interface TimerProgressProps {
  deadline: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

export function TimerProgress({ deadline, label, size = 'md' }: TimerProgressProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(0);

  useEffect(() => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = deadline - now;
    setTimeRemaining(Math.max(0, remaining));

    // Calculate total duration (assume deadline was set for reasonable period)
    // This could be improved by storing original duration
    setTotalDuration(remaining > 0 ? remaining : 3600); // fallback to 1 hour

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = deadline - now;
      setTimeRemaining(Math.max(0, remaining));
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  const progress = totalDuration > 0 ? (timeRemaining / totalDuration) * 100 : 0;
  const isUrgent = timeRemaining < 300; // < 5 minutes
  const isExpired = timeRemaining <= 0;

  const progressColor = isExpired
    ? 'bg-destructive'
    : isUrgent
    ? 'bg-amber-500'
    : 'bg-accent';

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }[size];

  const getTimeRemaining = (deadline: number): string => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = deadline - now;

    if (remaining <= 0) return 'Deadline passed';

    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-white">{label}</span>
        <span className={`text-sm font-semibold ${isExpired ? 'text-destructive' : isUrgent ? 'text-amber-500' : 'text-white'}`}>
          {getTimeRemaining(deadline)}
        </span>
      </div>

      <div className="w-full bg-muted rounded-full overflow-hidden">
        <div
          className={`${progressColor} ${sizeClasses} transition-all duration-1000 ease-linear rounded-full`}
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>
    </div>
  );
}
