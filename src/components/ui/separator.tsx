import React from 'react';

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}

export const Separator: React.FC<SeparatorProps> = ({
  orientation = 'horizontal',
  className = '',
  ...props
}) => {
  const orientationClasses = orientation === 'horizontal' 
    ? 'h-[1px] w-full' 
    : 'h-full w-[1px]';

  return (
    <div
      className={`shrink-0 bg-border ${orientationClasses} ${className}`}
      {...props}
    />
  );
};