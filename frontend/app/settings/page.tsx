"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Accessibility,
  Code,
  Monitor,
  Palette,
  Volume2,
  Eye,
  Keyboard,
  MousePointer,
  Globe,
  Bell,
  Download,
  Shield,
  User,
  RefreshCw,
  Search,
  BarChart3,
  Network,
  Bug,
  Database,
  Layers,
  Grid3X3,
  Smartphone,
} from "lucide-react";

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

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("accessibility");

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("core-settings");
    if (savedSettings) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("core-settings", JSON.stringify(settings));
    applySettings(settings);
  }, [settings]);

  const applySettings = (newSettings: SettingsState) => {
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
    
    // Apply grid overlay
    if (newSettings.gridOverlay) {
      document.documentElement.classList.add("grid-overlay");
    } else {
      document.documentElement.classList.remove("grid-overlay");
    }
  };

  const updateSetting = <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSection = (section: string) => {
    const sectionDefaults = Object.keys(defaultSettings).reduce((acc, key) => {
      if (
        (section === "accessibility" && [
          "fontSize", "highContrast", "reducedMotion", "screenReader",
          "keyboardNavigation", "colorBlindSupport", "textToSpeech", "focusIndicators"
        ].includes(key)) ||
        (section === "developer" && [
          "apiDebugMode", "consoleLogging", "performanceMetrics", "componentInspector",
          "networkMonitor", "errorBoundaryInfo", "localStorageManager", "themeMode",
          "gridOverlay", "responsiveIndicator"
        ].includes(key)) ||
        (section === "general" && [
          "language", "emailNotifications", "pushNotifications", "inAppNotifications",
          "dataExport", "dataCollection", "dataSharing"
        ].includes(key))
      ) {
        (acc as any)[key] = (defaultSettings as any)[key];
      }
      return acc;
    }, {} as Partial<SettingsState>);
    
    setSettings(prev => ({ ...prev, ...sectionDefaults }));
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

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setSettings({ ...defaultSettings, ...importedSettings });
        } catch (error) {
          console.error("Failed to import settings:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  const clearLocalStorage = () => {
    if (confirm("Are you sure you want to clear all local storage data? This action cannot be undone.")) {
      localStorage.clear();
      alert("Local storage cleared successfully.");
    }
  };

  const sections = [
    { id: "accessibility", label: "Accessibility", icon: Accessibility },
    { id: "developer", label: "Developer Tools", icon: Code },
    { id: "general", label: "General", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Settings className="h-6 w-6 text-emerald-400" />
                Settings
              </h1>
              <p className="text-slate-400 mt-1">
                Customize your CORE experience with accessibility options and developer tools
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search settings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white w-64"
                />
              </div>
              <Button
                onClick={exportSettings}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-900/50 border-slate-700 sticky top-24">
              <CardHeader>
                <CardTitle className="text-white text-lg">Sections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? "bg-emerald-500 text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-emerald-400"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {section.label}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Accessibility Settings */}
            {activeSection === "accessibility" && (
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Accessibility className="h-5 w-5 text-emerald-400" />
                      Accessibility Settings
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Customize the interface for better accessibility and usability
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => resetSection("accessibility")}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Font Size */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-emerald-400" />
                      <Label className="text-white font-medium">Font Size</Label>
                      <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                        {settings.fontSize}px
                      </Badge>
                    </div>
                    <Slider
                      value={[settings.fontSize]}
                      onValueChange={([value]) => updateSetting("fontSize", value)}
                      min={12}
                      max={24}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Small (12px)</span>
                      <span>Large (24px)</span>
                    </div>
                  </div>

                  <Separator className="bg-slate-700" />

                  {/* Toggle Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Palette className="h-4 w-4 text-emerald-400" />
                        <div>
                          <Label className="text-white font-medium">High Contrast</Label>
                          <p className="text-xs text-slate-400">Enhanced color contrast for better visibility</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.highContrast}
                        onCheckedChange={(checked) => updateSetting("highContrast", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Monitor className="h-4 w-4 text-emerald-400" />
                        <div>
                          <Label className="text-white font-medium">Reduced Motion</Label>
                          <p className="text-xs text-slate-400">Minimize animations and transitions</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.reducedMotion}
                        onCheckedChange={(checked) => updateSetting("reducedMotion", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Volume2 className="h-4 w-4 text-emerald-400" />
                        <div>
                          <Label className="text-white font-medium">Screen Reader Support</Label>
                          <p className="text-xs text-slate-400">Enhanced ARIA labels and descriptions</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.screenReader}
                        onCheckedChange={(checked) => updateSetting("screenReader", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Keyboard className="h-4 w-4 text-emerald-400" />
                        <div>
                          <Label className="text-white font-medium">Keyboard Navigation</Label>
                          <p className="text-xs text-slate-400">Enhanced keyboard navigation support</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.keyboardNavigation}
                        onCheckedChange={(checked) => updateSetting("keyboardNavigation", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Eye className="h-4 w-4 text-emerald-400" />
                        <div>
                          <Label className="text-white font-medium">Color Blind Support</Label>
                          <p className="text-xs text-slate-400">Alternative color schemes and patterns</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.colorBlindSupport}
                        onCheckedChange={(checked) => updateSetting("colorBlindSupport", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <MousePointer className="h-4 w-4 text-emerald-400" />
                        <div>
                          <Label className="text-white font-medium">Focus Indicators</Label>
                          <p className="text-xs text-slate-400">Enhanced visual focus indicators</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.focusIndicators}
                        onCheckedChange={(checked) => updateSetting("focusIndicators", checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Developer Tools */}
            {activeSection === "developer" && (
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Code className="h-5 w-5 text-emerald-400" />
                      Developer Tools
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Advanced debugging and development features
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => resetSection("developer")}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Console Logging Level */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Bug className="h-4 w-4 text-emerald-400" />
                      <Label className="text-white font-medium">Console Logging Level</Label>
                    </div>
                    <Select
                      value={settings.consoleLogging}
                      onValueChange={(value) => updateSetting("consoleLogging", value)}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="error">Error Only</SelectItem>
                        <SelectItem value="warn">Warning & Error</SelectItem>
                        <SelectItem value="info">Info, Warning & Error</SelectItem>
                        <SelectItem value="debug">All (Debug Mode)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator className="bg-slate-700" />

                  {/* Developer Toggle Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Network className="h-4 w-4 text-emerald-400" />
                        <div>
                          <Label className="text-white font-medium">API Debug Mode</Label>
                          <p className="text-xs text-slate-400">Show API request/response details</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.apiDebugMode}
                        onCheckedChange={(checked) => updateSetting("apiDebugMode", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <BarChart3 className="h-4 w-4 text-emerald-400" />
                        <div>
                          <Label className="text-white font-medium">Performance Metrics</Label>
                          <p className="text-xs text-slate-400">Display page load and API response times</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.performanceMetrics}
                        onCheckedChange={(checked) => updateSetting("performanceMetrics", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Layers className="h-4 w-4 text-emerald-400" />
                        <div>
                          <Label className="text-white font-medium">Component Inspector</Label>
                          <p className="text-xs text-slate-400">Show component boundaries and props</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.componentInspector}
                        onCheckedChange={(checked) => updateSetting("componentInspector", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Network className="h-4 w-4 text-emerald-400" />
                        <div>
                          <Label className="text-white font-medium">Network Monitor</Label>
                          <p className="text-xs text-slate-400">Display API calls and their status</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.networkMonitor}
                        onCheckedChange={(checked) => updateSetting("networkMonitor", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-emerald-400" />
                        <div>
                          <Label className="text-white font-medium">Error Boundary Info</Label>
                          <p className="text-xs text-slate-400">Show detailed error information</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.errorBoundaryInfo}
                        onCheckedChange={(checked) => updateSetting("errorBoundaryInfo", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Grid3X3 className="h-4 w-4 text-emerald-400" />
                        <div>
                          <Label className="text-white font-medium">Grid Overlay</Label>
                          <p className="text-xs text-slate-400">Show layout grid for design verification</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.gridOverlay}
                        onCheckedChange={(checked) => updateSetting("gridOverlay", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-4 w-4 text-emerald-400" />
                        <div>
                          <Label className="text-white font-medium">Responsive Indicator</Label>
                          <p className="text-xs text-slate-400">Show current screen size breakpoint</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.responsiveIndicator}
                        onCheckedChange={(checked) => updateSetting("responsiveIndicator", checked)}
                      />
                    </div>
                  </div>

                  <Separator className="bg-slate-700" />

                  {/* Local Storage Management */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-emerald-400" />
                      <Label className="text-white font-medium">Local Storage Management</Label>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={clearLocalStorage}
                        variant="destructive"
                        size="sm"
                      >
                        Clear All Data
                      </Button>
                      <input
                        type="file"
                        accept=".json"
                        onChange={importSettings}
                        className="hidden"
                        id="import-settings"
                      />
                      <Button
                        onClick={() => document.getElementById("import-settings")?.click()}
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        Import Settings
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* General Settings */}
            {activeSection === "general" && (
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="h-5 w-5 text-emerald-400" />
                      General Settings
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Language, notifications, and privacy preferences
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => resetSection("general")}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Language Selection */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-emerald-400" />
                      <Label className="text-white font-medium">Language</Label>
                    </div>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => updateSetting("language", value)}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="zh">中文</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator className="bg-slate-700" />

                  {/* Notification Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-emerald-400" />
                      <Label className="text-white font-medium">Notification Preferences</Label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                        <div>
                          <Label className="text-white font-medium">Email Notifications</Label>
                          <p className="text-xs text-slate-400">Receive updates via email</p>
                        </div>
                        <Switch
                          checked={settings.emailNotifications}
                          onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                        <div>
                          <Label className="text-white font-medium">Push Notifications</Label>
                          <p className="text-xs text-slate-400">Browser push notifications</p>
                        </div>
                        <Switch
                          checked={settings.pushNotifications}
                          onCheckedChange={(checked) => updateSetting("pushNotifications", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                        <div>
                          <Label className="text-white font-medium">In-App Notifications</Label>
                          <p className="text-xs text-slate-400">Show notifications within the app</p>
                        </div>
                        <Switch
                          checked={settings.inAppNotifications}
                          onCheckedChange={(checked) => updateSetting("inAppNotifications", checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-slate-700" />

                  {/* Privacy Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-emerald-400" />
                      <Label className="text-white font-medium">Privacy & Data</Label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                        <div>
                          <Label className="text-white font-medium">Data Export</Label>
                          <p className="text-xs text-slate-400">Allow exporting your data</p>
                        </div>
                        <Switch
                          checked={settings.dataExport}
                          onCheckedChange={(checked) => updateSetting("dataExport", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                        <div>
                          <Label className="text-white font-medium">Data Collection</Label>
                          <p className="text-xs text-slate-400">Allow anonymous usage analytics</p>
                        </div>
                        <Switch
                          checked={settings.dataCollection}
                          onCheckedChange={(checked) => updateSetting("dataCollection", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                        <div>
                          <Label className="text-white font-medium">Data Sharing</Label>
                          <p className="text-xs text-slate-400">Share data with third parties</p>
                        </div>
                        <Switch
                          checked={settings.dataSharing}
                          onCheckedChange={(checked) => updateSetting("dataSharing", checked)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}