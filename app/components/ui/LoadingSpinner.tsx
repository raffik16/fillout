import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  text,
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="relative">
        {/* Outer ring */}
        <div className={cn(
          "rounded-full border-4 border-orange-200",
          sizeClasses[size]
        )} />
        
        {/* Spinning gradient ring */}
        <div className={cn(
          "absolute inset-0 rounded-full border-4 border-transparent border-t-orange-400 border-r-orange-300 animate-spin",
          sizeClasses[size]
        )} />
        
        {/* Inner pulsing dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            "rounded-full bg-orange-400 animate-pulse",
            size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'
          )} />
        </div>
      </div>
      
      {text && (
        <p className={cn(
          "mt-4 text-gray-600 animate-pulse",
          size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'
        )}>
          {text}
        </p>
      )}
    </div>
  );
}