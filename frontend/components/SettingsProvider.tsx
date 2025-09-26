"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface SettingsState {
  // Accessibility Settings
  fontSize: number;
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  colorBlindSupport: boolean;
  textToSpeech: boolean;
  focusIndicators: boolean;
  
  // Developer Tools
  apiDebugMode: boolean;
  consoleLogging: string;
  performanceMetrics: boolean;
  componentInspector: boolean;
  networkMonitor: boolean;
  errorBoundaryInfo: boolean;
  localStorageManager: boolean;
  themeMode: string;
  gridOverlay: boolean;
  responsiveIndicator: boolean;
  
  // General Settings
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  dataExport: boolean;
  dataCollection: boolean;
  dataSharing: boolean;
}

const defaultSettings: SettingsState = {
  fontSize: 16,
  highContrast: false,
  reducedMotion: false,
  screenReader: false,
  keyboardNavigation: true,
  colorBlindSupport: false,
  textToSpeech: false,
  focusIndicators: true,
  apiDebugMode: false,
  consoleLogging: "error",
  performanceMetrics: false,
  componentInspector: false,
  networkMonitor: false,
  errorBoundaryInfo: false,
  localStorageManager: false,
  themeMode: "dark",
  gridOverlay: false,
  responsiveIndicator: false,
  language: "en",
  emailNotifications: true,
  pushNotifications: false,
  inAppNotifications: true,
  dataExport: true,
  dataCollection: true,
  dataSharing: false,
};

interface SettingsContextType {
  settings: SettingsState;
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  resetSettings: () => void;
  exportSettings: () => void;
  importSettings: (settings: Partial<SettingsState>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

interface SettingsProviderProps {
  children: React.ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [isClient, setIsClient] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    const savedSettings = localStorage.getItem("core-settings");
    if (savedSettings) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }
  }, []);

  // Apply settings to document when they change
  useEffect(() => {
    if (!isClient) return;
    
    // Save to localStorage
    localStorage.setItem("core-settings", JSON.stringify(settings));
    
    // Apply settings to document
    applySettings(settings);
  }, [settings, isClient]);

  const applySettings = (newSettings: SettingsState) => {
    if (typeof document === "undefined") return;
    
    // Apply font size
    document.documentElement.style.fontSize = `${newSettings.fontSize}px`;
    
    // Apply high contrast
    if (newSettings.highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
    
    // Apply reduced motion
    if (newSettings.reducedMotion) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }
    
    // Apply focus indicators
    if (newSettings.focusIndicators) {
      document.documentElement.classList.add("enhanced-focus");
    } else {
      document.documentElement.classList.remove("enhanced-focus");
    }
    
    // Apply color blind support
    if (newSettings.colorBlindSupport) {
      document.documentElement.classList.add("color-blind-support");
    } else {
      document.documentElement.classList.remove("color-blind-support");
    }
    
    // Apply grid overlay
    if (newSettings.gridOverlay) {
      document.documentElement.classList.add("grid-overlay");
    } else {
      document.documentElement.classList.remove("grid-overlay");
    }
    
    // Apply responsive indicator
    if (newSettings.responsiveIndicator) {
      document.documentElement.classList.add("responsive-indicator");
    } else {
      document.documentElement.classList.remove("responsive-indicator");
    }
  };

  const updateSetting = <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "core-settings.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (importedSettings: Partial<SettingsState>) => {
    setSettings(prev => ({ ...prev, ...importedSettings }));
  };

  const value: SettingsContextType = {
    settings,
    updateSetting,
    resetSettings,
    exportSettings,
    importSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export type { SettingsState };