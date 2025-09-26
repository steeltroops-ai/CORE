"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Zap, Brain, Search, BarChart3 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse' | 'bounce' | 'themed';
  className?: string;
  text?: string;
  showText?: boolean;
  stage?: 'processing' | 'analyzing' | 'searching' | 'generating';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  className,
  text,
  showText = true,
  stage = 'processing',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const getStageIcon = () => {
    switch (stage) {
      case 'analyzing':
        return <Brain className={cn(sizeClasses[size], 'animate-pulse text-emerald-600')} />;
      case 'searching':
        return <Search className={cn(sizeClasses[size], 'animate-pulse text-blue-600')} />;
      case 'generating':
        return <BarChart3 className={cn(sizeClasses[size], 'animate-pulse text-purple-600')} />;
      default:
        return <Zap className={cn(sizeClasses[size], 'animate-pulse text-emerald-600')} />;
    }
  };

  const getStageText = () => {
    if (text) return text;
    
    switch (stage) {
      case 'analyzing':
        return 'Analyzing document...';
      case 'searching':
        return 'Searching patent database...';
      case 'generating':
        return 'Generating insights...';
      default:
        return 'Processing...';
    }
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1" role="status" aria-label="Loading">
            <div className="h-2 w-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 bg-emerald-600 rounded-full animate-bounce"></div>
          </div>
        );
      
      case 'pulse':
        return (
          <div 
            className={cn(
              'bg-emerald-600 rounded-full animate-pulse',
              sizeClasses[size]
            )}
            role="status"
            aria-label="Loading"
          />
        );
      
      case 'bounce':
        return (
          <div 
            className={cn(
              'bg-emerald-600 rounded-full animate-bounce',
              sizeClasses[size]
            )}
            role="status"
            aria-label="Loading"
          />
        );
      
      case 'themed':
        return (
          <div className="flex items-center justify-center" role="status" aria-label="Loading">
            {getStageIcon()}
          </div>
        );
      
      default:
        return (
          <Loader2 
            className={cn(
              'animate-spin text-emerald-600',
              sizeClasses[size]
            )}
            role="status"
            aria-label="Loading"
          />
        );
    }
  };

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
      {renderSpinner()}
      {showText && (
        <p className="text-sm text-gray-600 animate-pulse" aria-live="polite">
          {getStageText()}
        </p>
      )}
      <span className="sr-only">{getStageText()}</span>
    </div>
  );
};

// Skeleton components for different content types
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('animate-pulse', className)} role="status" aria-label="Loading content">
    <div className="bg-gray-200 rounded-lg p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <div className="bg-gray-300 rounded-full h-10 w-10"></div>
        <div className="space-y-2 flex-1">
          <div className="bg-gray-300 rounded h-4 w-3/4"></div>
          <div className="bg-gray-300 rounded h-3 w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="bg-gray-300 rounded h-3 w-full"></div>
        <div className="bg-gray-300 rounded h-3 w-5/6"></div>
        <div className="bg-gray-300 rounded h-3 w-4/6"></div>
      </div>
    </div>
    <span className="sr-only">Loading card content</span>
  </div>
);

export const SkeletonChart: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('animate-pulse', className)} role="status" aria-label="Loading chart">
    <div className="bg-gray-200 rounded-lg p-6">
      <div className="bg-gray-300 rounded h-6 w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="flex items-end space-x-2 h-32">
          <div className="bg-gray-300 rounded w-8 h-16"></div>
          <div className="bg-gray-300 rounded w-8 h-24"></div>
          <div className="bg-gray-300 rounded w-8 h-20"></div>
          <div className="bg-gray-300 rounded w-8 h-28"></div>
          <div className="bg-gray-300 rounded w-8 h-12"></div>
        </div>
      </div>
    </div>
    <span className="sr-only">Loading chart data</span>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; className?: string }> = ({ 
  rows = 5, 
  className 
}) => (
  <div className={cn('animate-pulse', className)} role="status" aria-label="Loading table">
    <div className="bg-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-300 p-4 flex space-x-4">
        <div className="bg-gray-400 rounded h-4 w-1/4"></div>
        <div className="bg-gray-400 rounded h-4 w-1/4"></div>
        <div className="bg-gray-400 rounded h-4 w-1/4"></div>
        <div className="bg-gray-400 rounded h-4 w-1/4"></div>
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-t border-gray-300 flex space-x-4">
          <div className="bg-gray-300 rounded h-3 w-1/4"></div>
          <div className="bg-gray-300 rounded h-3 w-1/4"></div>
          <div className="bg-gray-300 rounded h-3 w-1/4"></div>
          <div className="bg-gray-300 rounded h-3 w-1/4"></div>
        </div>
      ))}
    </div>
    <span className="sr-only">Loading table data</span>
  </div>
);

export const SkeletonText: React.FC<{ 
  lines?: number; 
  className?: string;
  variant?: 'paragraph' | 'title' | 'subtitle';
}> = ({ 
  lines = 3, 
  className,
  variant = 'paragraph'
}) => {
  const getLineWidth = (index: number) => {
    if (variant === 'title') return 'w-3/4';
    if (variant === 'subtitle') return 'w-1/2';
    
    // Paragraph - vary line widths for natural look
    const widths = ['w-full', 'w-5/6', 'w-4/6', 'w-3/4', 'w-2/3'];
    return widths[index % widths.length];
  };

  const getLineHeight = () => {
    switch (variant) {
      case 'title': return 'h-6';
      case 'subtitle': return 'h-4';
      default: return 'h-3';
    }
  };

  return (
    <div className={cn('animate-pulse space-y-2', className)} role="status" aria-label="Loading text">
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className={cn(
            'bg-gray-300 rounded',
            getLineHeight(),
            getLineWidth(i)
          )}
        />
      ))}
      <span className="sr-only">Loading text content</span>
    </div>
  );
};

export default LoadingSpinner;