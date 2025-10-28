import React, { useState, useCallback } from 'react';

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  defaultValue = [0],
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  className = '',
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  
  const currentValue = value ?? internalValue;
  const currentSingleValue = currentValue[0];

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = [Number(event.target.value)];
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  }, [value, onValueChange]);

  const percentage = ((currentSingleValue - min) / (max - min)) * 100;

  return (
    <div className={`relative flex w-full touch-none select-none items-center ${className}`}>
      <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <div 
          className="absolute h-full bg-primary" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentSingleValue}
        onChange={handleChange}
        className="absolute h-2 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        {...props}
      />
    </div>
  );
};