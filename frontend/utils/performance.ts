import { lazy, ComponentType } from 'react';

// Code splitting utility with error boundaries
export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ComponentType
) => {
  const LazyComponent = lazy(importFn);
  
  // Add display name for debugging
  (LazyComponent as any).displayName = 'LazyComponent';
  
  return LazyComponent;
};

// Performance monitoring utilities
export const performanceMonitor = {
  // Measure component render time
  measureRender: (componentName: string, renderFn: () => void) => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render time: ${(end - start).toFixed(2)}ms`);
    }
  },

  // Measure async operations
  measureAsync: async <T>(operationName: string, asyncFn: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    try {
      const result = await asyncFn();
      const end = performance.now();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${operationName} completed in: ${(end - start).toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const end = performance.now();
      
      if (process.env.NODE_ENV === 'development') {
        console.error(`${operationName} failed after: ${(end - start).toFixed(2)}ms`, error);
      }
      
      throw error;
    }
  },

  // Mark performance milestones
  mark: (name: string) => {
    if ('mark' in performance) {
      performance.mark(name);
    }
  },

  // Measure between marks
  measure: (name: string, startMark: string, endMark: string) => {
    if ('measure' in performance) {
      performance.measure(name, startMark, endMark);
      
      if (process.env.NODE_ENV === 'development') {
        const entries = performance.getEntriesByName(name, 'measure');
        const latest = entries[entries.length - 1];
        if (latest) {
          console.log(`${name}: ${latest.duration.toFixed(2)}ms`);
        }
      }
    }
  }
};

// Image optimization utilities
export const imageOptimization = {
  // Generate responsive image URLs
  generateResponsiveUrls: (baseUrl: string, sizes: number[] = [320, 640, 768, 1024, 1280, 1536]) => {
    return sizes.map(size => ({
      url: `${baseUrl}?w=${size}&q=75`,
      width: size
    }));
  },

  // Create srcSet string
  createSrcSet: (baseUrl: string, sizes: number[] = [320, 640, 768, 1024, 1280, 1536]) => {
    return sizes
      .map(size => `${baseUrl}?w=${size}&q=75 ${size}w`)
      .join(', ');
  },

  // Preload critical images
  preloadImage: (src: string, priority: 'high' | 'low' = 'low') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    if (priority === 'high') {
      link.setAttribute('fetchpriority', 'high');
    }
    document.head.appendChild(link);
  }
};

// Bundle size optimization
export const bundleOptimization = {
  // Conditional loading based on device capabilities
  loadForDevice: async <T>(mobileLoader: () => Promise<T>, desktopLoader: () => Promise<T>): Promise<T> => {
    const isMobile = window.innerWidth < 768;
    return isMobile ? mobileLoader() : desktopLoader();
  },

  // Lazy load component based on condition
  conditionalLoad: async <T>(condition: boolean, trueLoader: () => Promise<T>, falseLoader: () => Promise<T>): Promise<T> => {
    return condition ? trueLoader() : falseLoader();
  }
};

// Memory management utilities
export const memoryManagement = {
  // Cleanup function for components
  createCleanup: () => {
    const cleanupFunctions: (() => void)[] = [];
    
    return {
      add: (fn: () => void) => cleanupFunctions.push(fn),
      cleanup: () => {
        cleanupFunctions.forEach(fn => {
          try {
            fn();
          } catch (error) {
            console.error('Cleanup function failed:', error);
          }
        });
        cleanupFunctions.length = 0;
      }
    };
  },

  // Debounce utility for performance
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle utility for performance
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// Network optimization
export const networkOptimization = {
  // Check connection quality
  getConnectionQuality: (): 'slow' | 'fast' | 'unknown' => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        const { effectiveType, downlink } = connection;
        
        if (effectiveType === '4g' && downlink > 10) return 'fast';
        if (effectiveType === '3g' || downlink < 1.5) return 'slow';
      }
    }
    return 'unknown';
  },

  // Adaptive loading based on connection
  adaptiveLoad: async <T>(
    fastConnectionLoader: () => Promise<T>,
    slowConnectionLoader: () => Promise<T>
  ): Promise<T> => {
    const quality = networkOptimization.getConnectionQuality();
    
    if (quality === 'slow') {
      return slowConnectionLoader();
    }
    
    return fastConnectionLoader();
  },

  // Preload resources based on connection
  conditionalPreload: (resources: string[], connectionThreshold: 'fast' | 'slow' = 'fast') => {
    const quality = networkOptimization.getConnectionQuality();
    
    if (quality === 'fast' || (quality === 'unknown' && connectionThreshold === 'slow')) {
      resources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = resource;
        document.head.appendChild(link);
      });
    }
  }
};

// Device-specific optimizations
export const deviceOptimization = {
  // Detect device capabilities
  getDeviceInfo: () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
    const isTouchDevice = 'ontouchstart' in window;
    const hasHighDPI = window.devicePixelRatio > 1;
    const supportsWebP = (() => {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    })();
    
    return {
      isMobile,
      isTablet,
      isDesktop: !isMobile && !isTablet,
      isTouchDevice,
      hasHighDPI,
      supportsWebP,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight
    };
  },

  // Get optimal image format
  getOptimalImageFormat: (): 'webp' | 'jpg' => {
    const canvas = document.createElement('canvas');
    const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    return supportsWebP ? 'webp' : 'jpg';
  },

  // Optimize for device performance
  optimizeForDevice: () => {
    const device = deviceOptimization.getDeviceInfo();
    
    return {
      // Reduce animations on low-end devices
      shouldReduceAnimations: device.isMobile && window.innerWidth < 400,
      
      // Use smaller images on mobile
      maxImageWidth: device.isMobile ? 800 : device.isTablet ? 1200 : 1920,
      
      // Adjust quality based on device
      imageQuality: device.hasHighDPI ? 85 : 75,
      
      // Enable/disable features based on device
      enableHeavyAnimations: !device.isMobile,
      enableParallax: device.isDesktop,
      enableHapticFeedback: device.isTouchDevice
    };
  }
};

// Service Worker utilities
export const serviceWorkerUtils = {
  // Register service worker
  register: async (swPath: string = '/sw.js') => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      try {
        const registration = await navigator.serviceWorker.register(swPath);
        console.log('Service Worker registered:', registration);
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        throw error;
      }
    }
  },

  // Update service worker
  update: async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
      }
    }
  },

  // Check for updates
  checkForUpdates: (onUpdateAvailable: () => void) => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', onUpdateAvailable);
    }
  }
};

export default {
  createLazyComponent,
  performanceMonitor,
  imageOptimization,
  bundleOptimization,
  memoryManagement,
  networkOptimization,
  deviceOptimization,
  serviceWorkerUtils
};