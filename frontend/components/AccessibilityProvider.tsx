"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  EyeOff, 
  Type, 
  Contrast, 
  MousePointer, 
  Keyboard,
  Volume2,
  VolumeX,
  Settings,
  X
} from 'lucide-react';

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
  soundEnabled: boolean;
  focusVisible: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: boolean) => void;
  announceToScreenReader: (message: string) => void;
  isAccessibilityPanelOpen: boolean;
  toggleAccessibilityPanel: () => void;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  screenReaderMode: false,
  keyboardNavigation: true,
  soundEnabled: false,
  focusVisible: true,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [isAccessibilityPanelOpen, setIsAccessibilityPanelOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<string[]>([]);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.warn('Failed to parse accessibility settings:', error);
      }
    }

    // Check for system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    if (prefersReducedMotion || prefersHighContrast) {
      setSettings(prev => ({
        ...prev,
        reducedMotion: prefersReducedMotion,
        highContrast: prefersHighContrast,
      }));
    }
  }, []);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large text
    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Focus visible
    if (settings.focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }

    // Screen reader mode
    if (settings.screenReaderMode) {
      root.classList.add('screen-reader-mode');
    } else {
      root.classList.remove('screen-reader-mode');
    }

    // Save to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  // Keyboard navigation setup
  useEffect(() => {
    if (!settings.keyboardNavigation) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip navigation if user is typing in an input
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement) {
        return;
      }

      switch (event.key) {
        case 'Tab':
          // Enhanced tab navigation - ensure focus is visible
          if (settings.focusVisible) {
            setTimeout(() => {
              const focused = document.activeElement as HTMLElement;
              if (focused) {
                focused.classList.add('keyboard-focused');
              }
            }, 0);
          }
          break;
        
        case 'Escape':
          // Close any open panels or modals
          if (isAccessibilityPanelOpen) {
            setIsAccessibilityPanelOpen(false);
            event.preventDefault();
          }
          break;
        
        case 'F1':
          // Open accessibility panel
          if (event.altKey) {
            setIsAccessibilityPanelOpen(true);
            event.preventDefault();
          }
          break;
      }
    };

    const handleFocusOut = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (target) {
        target.classList.remove('keyboard-focused');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [settings.keyboardNavigation, settings.focusVisible, isAccessibilityPanelOpen]);

  const updateSetting = (key: keyof AccessibilitySettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Announce changes to screen readers
    const settingNames = {
      highContrast: 'High contrast',
      largeText: 'Large text',
      reducedMotion: 'Reduced motion',
      screenReaderMode: 'Screen reader mode',
      keyboardNavigation: 'Keyboard navigation',
      soundEnabled: 'Sound',
      focusVisible: 'Focus indicators',
    };
    
    announceToScreenReader(
      `${settingNames[key]} ${value ? 'enabled' : 'disabled'}`
    );
  };

  const announceToScreenReader = (message: string) => {
    setAnnouncements(prev => [...prev, message]);
    
    // Clear announcement after a delay
    setTimeout(() => {
      setAnnouncements(prev => prev.slice(1));
    }, 1000);
  };

  const toggleAccessibilityPanel = () => {
    setIsAccessibilityPanelOpen(prev => !prev);
  };

  const contextValue: AccessibilityContextType = {
    settings,
    updateSetting,
    announceToScreenReader,
    isAccessibilityPanelOpen,
    toggleAccessibilityPanel,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
      
      {/* Screen reader announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        role="status"
      >
        {announcements.map((announcement, index) => (
          <div key={index}>{announcement}</div>
        ))}
      </div>

      {/* Accessibility Panel */}
      {isAccessibilityPanelOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="accessibility-panel-title"
        >
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 id="accessibility-panel-title" className="text-lg font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Accessibility Settings
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAccessibilityPanelOpen(false)}
                aria-label="Close accessibility panel"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <CardContent className="p-4 space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Customize your experience with these accessibility options.
              </div>

              {/* Visual Settings */}
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-gray-900">Visual</h3>
                
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Contrast className="h-4 w-4" />
                    <span className="text-sm">High Contrast</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.highContrast}
                    onChange={(e) => updateSetting('highContrast', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${
                    settings.highContrast ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${
                      settings.highContrast ? 'translate-x-5' : 'translate-x-1'
                    }`} />
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    <span className="text-sm">Large Text</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.largeText}
                    onChange={(e) => updateSetting('largeText', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${
                    settings.largeText ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${
                      settings.largeText ? 'translate-x-5' : 'translate-x-1'
                    }`} />
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">Focus Indicators</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.focusVisible}
                    onChange={(e) => updateSetting('focusVisible', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${
                    settings.focusVisible ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${
                      settings.focusVisible ? 'translate-x-5' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              </div>

              {/* Motion Settings */}
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-gray-900">Motion</h3>
                
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <MousePointer className="h-4 w-4" />
                    <span className="text-sm">Reduced Motion</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.reducedMotion}
                    onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${
                    settings.reducedMotion ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${
                      settings.reducedMotion ? 'translate-x-5' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              </div>

              {/* Navigation Settings */}
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-gray-900">Navigation</h3>
                
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Keyboard className="h-4 w-4" />
                    <span className="text-sm">Keyboard Navigation</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.keyboardNavigation}
                    onChange={(e) => updateSetting('keyboardNavigation', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${
                    settings.keyboardNavigation ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${
                      settings.keyboardNavigation ? 'translate-x-5' : 'translate-x-1'
                    }`} />
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    {settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    <span className="text-sm">Sound Feedback</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${
                    settings.soundEnabled ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${
                      settings.soundEnabled ? 'translate-x-5' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              </div>

              <div className="pt-4 border-t text-xs text-gray-500">
                <p>Press Alt + F1 to open this panel anytime.</p>
                <p>Press Escape to close.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AccessibilityContext.Provider>
  );
};

// Accessibility floating button
export const AccessibilityButton: React.FC = () => {
  const { toggleAccessibilityPanel } = useAccessibility();

  return (
    <Button
      onClick={toggleAccessibilityPanel}
      className="fixed bottom-4 right-4 z-40 rounded-full w-12 h-12 shadow-lg"
      aria-label="Open accessibility settings (Alt + F1)"
      title="Accessibility Settings"
    >
      <Settings className="h-5 w-5" />
    </Button>
  );
};

export default AccessibilityProvider;