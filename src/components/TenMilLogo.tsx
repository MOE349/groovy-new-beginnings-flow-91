import React from 'react';
import { Settings } from 'lucide-react';

interface TenMilLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const TenMilLogo: React.FC<TenMilLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="bg-secondary rounded-lg p-2">
        <Settings className={`${iconSizes[size]} text-secondary-foreground`} />
      </div>
      <div className="flex flex-col">
        <span className={`${sizeClasses[size]} font-bold text-secondary tracking-wider`}>
          TENMIL
        </span>
        <span className="text-sm text-secondary/80 tracking-wide">
          FLEET MANAGEMENT
        </span>
      </div>
    </div>
  );
};

export default TenMilLogo;