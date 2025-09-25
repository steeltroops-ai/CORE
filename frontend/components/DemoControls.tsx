"use client";

import { useState } from "react";
import { LuPlay, LuLoader, LuFlaskConical, LuZap } from "react-icons/lu";

type DemoControlsProps = {
  onLoadPreset: (presetId: string) => Promise<void>;
};

type Preset = {
  id: string;
  label: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const PRESETS: Preset[] = [
  { 
    id: "max-planck", 
    label: "Max Planck Institute", 
    description: "Advanced materials research sample",
    category: "Research",
    icon: LuFlaskConical
  },
  { 
    id: "tum", 
    label: "TUM Robotics", 
    description: "Autonomous systems and AI research",
    category: "Technology",
    icon: LuZap
  },
];

export function DemoControls({ onLoadPreset }: DemoControlsProps) {
  const [loadingPreset, setLoadingPreset] = useState<string | null>(null);

  const handlePresetLoad = async (presetId: string) => {
    setLoadingPreset(presetId);
    try {
      await onLoadPreset(presetId);
    } finally {
      setLoadingPreset(null);
    }
  };

  return (
    <section className="fixed bottom-6 right-6 z-40 w-80 rounded-xl border border-slate-800 bg-slate-900/95 backdrop-blur-sm p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <LuPlay className="text-emerald-400" size={20} />
        <h3 className="text-lg font-semibold text-slate-100">Demo Controls</h3>
      </div>

      <p className="text-sm text-slate-400 mb-6">
        Load curated research samples for demonstration purposes.
      </p>

      <div className="space-y-3">
        {PRESETS.map((preset) => {
          const IconComponent = preset.icon;
          const isLoading = loadingPreset === preset.id;
          
          return (
            <button
              key={preset.id}
              onClick={() => handlePresetLoad(preset.id)}
              disabled={isLoading || loadingPreset !== null}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 p-4 text-left transition-all hover:border-emerald-500/50 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {isLoading ? (
                    <LuLoader className="text-emerald-400 animate-spin" size={18} />
                  ) : (
                    <IconComponent className="text-emerald-400 group-hover:text-emerald-300 transition-colors" size={18} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-slate-200 group-hover:text-slate-100 transition-colors">
                      {preset.label}
                    </h4>
                    <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded">
                      {preset.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                    {isLoading ? 'Loading preset...' : preset.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-500 text-center">
          Demo mode • Hackathon presentation
        </p>
      </div>
    </section>
  );
}
