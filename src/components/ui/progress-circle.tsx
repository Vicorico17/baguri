import { CheckCircle, Clock, XCircle } from 'lucide-react';

type ProgressCircleProps = {
  isComplete: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
};

export function ProgressCircle({ 
  isComplete, 
  size = 'sm', 
  variant = 'default' 
}: ProgressCircleProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  };

  if (isComplete) {
    return (
      <div className={`${sizeClasses[size]} flex items-center justify-center`}>
        <CheckCircle 
          size={iconSizes[size]} 
          className="text-green-400" 
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} border-2 border-zinc-600 rounded-full flex items-center justify-center`}>
      <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full"></div>
    </div>
  );
} 