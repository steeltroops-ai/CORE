import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface TouchPosition {
  x: number;
  y: number;
}

interface SwipeGestureProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  className?: string;
  disabled?: boolean;
}

// Swipe Gesture Component
export const SwipeGesture: React.FC<SwipeGestureProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  className,
  disabled = false
}) => {
  const [startPos, setStartPos] = useState<TouchPosition | null>(null);
  const [currentPos, setCurrentPos] = useState<TouchPosition | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    
    const touch = e.touches[0];
    setStartPos({ x: touch.clientX, y: touch.clientY });
    setCurrentPos({ x: touch.clientX, y: touch.clientY });
    setIsSwiping(true);

    // Haptic feedback on touch start (if supported)
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, [disabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || !startPos) return;
    
    const touch = e.touches[0];
    setCurrentPos({ x: touch.clientX, y: touch.clientY });
  }, [disabled, startPos]);

  const handleTouchEnd = useCallback(() => {
    if (disabled || !startPos || !currentPos) {
      setIsSwiping(false);
      return;
    }

    const deltaX = currentPos.x - startPos.x;
    const deltaY = currentPos.y - startPos.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Determine swipe direction
    if (Math.max(absDeltaX, absDeltaY) > threshold) {
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }

      // Haptic feedback on successful swipe
      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }
    }

    setStartPos(null);
    setCurrentPos(null);
    setIsSwiping(false);
  }, [disabled, startPos, currentPos, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return (
    <div
      ref={elementRef}
      className={cn('touch-pan-y', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        touchAction: disabled ? 'auto' : 'pan-y'
      }}
    >
      {children}
    </div>
  );
};

// Touch-friendly Button Component
interface TouchButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  hapticFeedback?: boolean;
  rippleEffect?: boolean;
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
  hapticFeedback = true,
  rippleEffect = true
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const baseClasses = 'relative overflow-hidden font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-slate-600 hover:bg-slate-700 text-white focus:ring-slate-500',
    ghost: 'bg-transparent hover:bg-slate-800 text-slate-300 focus:ring-slate-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]'
  };

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    // Haptic feedback
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }

    // Ripple effect
    if (rippleEffect && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rippleId = Date.now();

      setRipples(prev => [...prev, { id: rippleId, x, y }]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== rippleId));
      }, 600);
    }

    onClick?.();
  }, [disabled, hapticFeedback, rippleEffect, onClick]);

  return (
    <button
      ref={buttonRef}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        {
          'opacity-50 cursor-not-allowed active:scale-100': disabled
        },
        className
      )}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
      
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            animationDuration: '600ms'
          }}
        />
      ))}
    </button>
  );
};

// Draggable Component
interface DraggableProps {
  children: React.ReactNode;
  onDrag?: (deltaX: number, deltaY: number) => void;
  onDragEnd?: (deltaX: number, deltaY: number) => void;
  className?: string;
  disabled?: boolean;
  axis?: 'x' | 'y' | 'both';
}

export const Draggable: React.FC<DraggableProps> = ({
  children,
  onDrag,
  onDragEnd,
  className,
  disabled = false,
  axis = 'both'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState<TouchPosition | null>(null);
  const [currentPos, setCurrentPos] = useState<TouchPosition | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (disabled) return;
    
    setStartPos({ x: clientX, y: clientY });
    setCurrentPos({ x: clientX, y: clientY });
    setIsDragging(true);

    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, [disabled]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (disabled || !startPos || !isDragging) return;
    
    const newPos = { x: clientX, y: clientY };
    setCurrentPos(newPos);

    const deltaX = axis === 'y' ? 0 : newPos.x - startPos.x;
    const deltaY = axis === 'x' ? 0 : newPos.y - startPos.y;
    
    onDrag?.(deltaX, deltaY);
  }, [disabled, startPos, isDragging, axis, onDrag]);

  const handleEnd = useCallback(() => {
    if (disabled || !startPos || !currentPos) {
      setIsDragging(false);
      return;
    }

    const deltaX = axis === 'y' ? 0 : currentPos.x - startPos.x;
    const deltaY = axis === 'x' ? 0 : currentPos.y - startPos.y;
    
    onDragEnd?.(deltaX, deltaY);
    
    setStartPos(null);
    setCurrentPos(null);
    setIsDragging(false);
  }, [disabled, startPos, currentPos, axis, onDragEnd]);

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  // Mouse events (for desktop compatibility)
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMoveGlobal = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleMouseUpGlobal = () => {
      handleEnd();
    };

    document.addEventListener('mousemove', handleMouseMoveGlobal);
    document.addEventListener('mouseup', handleMouseUpGlobal);

    return () => {
      document.removeEventListener('mousemove', handleMouseMoveGlobal);
      document.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [isDragging, handleMove, handleEnd]);

  return (
    <div
      ref={elementRef}
      className={cn(
        'touch-none select-none',
        {
          'cursor-grab': !disabled && !isDragging,
          'cursor-grabbing': !disabled && isDragging,
          'cursor-not-allowed': disabled
        },
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={isDragging ? handleMouseMove : undefined}
      onMouseUp={handleEnd}
    >
      {children}
    </div>
  );
};

// Pull to Refresh Component
interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  className?: string;
  disabled?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 80,
  className,
  disabled = false
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const touch = e.touches[0];
    setStartY(touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || isRefreshing || !containerRef.current) return;
    
    const touch = e.touches[0];
    const currentY = touch.clientY;
    const deltaY = currentY - startY;
    
    // Only allow pull down when at top of container
    if (containerRef.current.scrollTop === 0 && deltaY > 0) {
      e.preventDefault();
      setPullDistance(Math.min(deltaY * 0.5, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (disabled || isRefreshing) return;
    
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      
      if ('vibrate' in navigator) {
        navigator.vibrate(25);
      }
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
  };

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const showRefreshIndicator = pullDistance > 0 || isRefreshing;

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-auto', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateY(${pullDistance}px)`,
        transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none'
      }}
    >
      {/* Refresh Indicator */}
      {showRefreshIndicator && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 bg-slate-800/90 backdrop-blur-sm"
          style={{
            transform: `translateY(-${Math.max(0, threshold - pullDistance)}px)`,
            opacity: pullProgress
          }}
        >
          <div className="flex items-center space-x-2 text-slate-300">
            {isRefreshing ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-500 border-t-slate-300 rounded-full animate-spin" />
                <span className="text-sm">Refreshing...</span>
              </>
            ) : (
              <>
                <div 
                  className="w-4 h-4 border-2 border-slate-500 border-t-slate-300 rounded-full transition-transform duration-200"
                  style={{
                    transform: `rotate(${pullProgress * 180}deg)`
                  }}
                />
                <span className="text-sm">
                  {pullProgress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
                </span>
              </>
            )}
          </div>
        </div>
      )}
      
      {children}
    </div>
  );
};

const TouchInteractions = {
  SwipeGesture,
  TouchButton,
  Draggable,
  PullToRefresh
};

export default TouchInteractions;