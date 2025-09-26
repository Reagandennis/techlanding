import React from 'react';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({
  children,
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  return (
    <div
      className={`relative flex ${sizeClasses[size]} shrink-0 overflow-hidden rounded-full ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export const AvatarImage: React.FC<AvatarImageProps> = ({
  className = '',
  ...props
}) => {
  return (
    <img
      className={`aspect-square h-full w-full object-cover ${className}`}
      {...props}
    />
  );
};

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};