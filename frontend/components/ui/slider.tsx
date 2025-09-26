"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, value = [0], onValueChange, min = 0, max = 100, step = 1, disabled = false, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value[0] || 0);
    const currentValue = value[0] !== undefined ? value[0] : internalValue;
    
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(event.target.value);
      setInternalValue(newValue);
      if (onValueChange) {
        onValueChange([newValue]);
      }
    };

    const percentage = ((currentValue - min) / (max - min)) * 100;

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        {...props}
      >
        <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-700">
          <div 
            className="absolute h-full bg-emerald-600 transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div 
          className="absolute block h-5 w-5 rounded-full border-2 border-emerald-600 bg-white ring-offset-slate-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 -translate-x-1/2"
          style={{ left: `${percentage}%` }}
        />
      </div>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };