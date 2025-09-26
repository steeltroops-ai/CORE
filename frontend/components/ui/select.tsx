"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
  disabled?: boolean;
}

interface SelectTriggerProps {
  className?: string;
  children?: React.ReactNode;
}

interface SelectContentProps {
  className?: string;
  children?: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  children?: React.ReactNode;
  className?: string;
}

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({ isOpen: false, setIsOpen: () => {} });

const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
  const { value } = React.useContext(SelectContext);
  return <span>{value || placeholder}</span>;
};

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen, setIsOpen } = React.useContext(SelectContext);
    
    return (
      <button
        ref={ref}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm ring-offset-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen } = React.useContext(SelectContext);
    
    if (!isOpen) return null;
    
    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 mt-1 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-slate-700 bg-slate-800 text-slate-200 shadow-md",
          className
        )}
        {...props}
      >
        <div className="p-1">
          {children}
        </div>
      </div>
    );
  }
);
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, ...props }, ref) => {
    const { value: selectedValue, onValueChange, setIsOpen } = React.useContext(SelectContext);
    const isSelected = selectedValue === value;
    
    const handleClick = () => {
      if (onValueChange) {
        onValueChange(value);
      }
      setIsOpen(false);
    };
    
    return (
      <div
        ref={ref}
        onClick={handleClick}
        className={cn(
          "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none hover:bg-emerald-600 hover:text-white transition-colors",
          isSelected && "bg-emerald-600 text-white",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SelectItem.displayName = "SelectItem";

const SelectSeparator = React.forwardRef<HTMLDivElement, { className?: string }>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-slate-700", className)}
      {...props}
    />
  )
);
SelectSeparator.displayName = "SelectSeparator";

export {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectSeparator,
};