"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Code,
  Building,
  Eye,
  Settings,
  BarChart3,
  Activity,
  Layers,
} from "lucide-react";

interface UserPersona {
  id: string;
  name: string;
  role: string;
  preferences: {
    showTechnicalDetails: boolean;
    showProcessingMetrics: boolean;
    preferredView: 'overview' | 'detailed' | 'technical';
  };
}

interface UserPersonaSelectorProps {
  currentPersona: UserPersona;
  onPersonaChange: (persona: UserPersona) => void;
  className?: string;
}

const personas: UserPersona[] = [
  {
    id: 'researcher',
    name: 'Researcher',
    role: 'Research Scientist',
    preferences: {
      showTechnicalDetails: false,
      showProcessingMetrics: false,
      preferredView: 'overview'
    }
  },
  {
    id: 'developer',
    name: 'Developer',
    role: 'Software Engineer',
    preferences: {
      showTechnicalDetails: true,
      showProcessingMetrics: true,
      preferredView: 'technical'
    }
  },
  {
    id: 'tech_transfer',
    name: 'Tech Transfer Officer',
    role: 'Technology Transfer',
    preferences: {
      showTechnicalDetails: false,
      showProcessingMetrics: false,
      preferredView: 'detailed'
    }
  }
];

const UserPersonaSelector: React.FC<UserPersonaSelectorProps> = ({
  currentPersona,
  onPersonaChange,
  className = "",
}) => {
  const getPersonaIcon = (personaId: string) => {
    switch (personaId) {
      case 'researcher':
        return <Users className="text-blue-400" size={16} />;
      case 'developer':
        return <Code className="text-green-400" size={16} />;
      case 'tech_transfer':
        return <Building className="text-purple-400" size={16} />;
      default:
        return <Users className="text-slate-400" size={16} />;
    }
  };

  const getPersonaColor = (personaId: string) => {
    switch (personaId) {
      case 'researcher':
        return 'border-blue-500/30 bg-blue-500/10 text-blue-300';
      case 'developer':
        return 'border-green-500/30 bg-green-500/10 text-green-300';
      case 'tech_transfer':
        return 'border-purple-500/30 bg-purple-500/10 text-purple-300';
      default:
        return 'border-slate-500/30 bg-slate-500/10 text-slate-300';
    }
  };

  const getViewIcon = (view: string) => {
    switch (view) {
      case 'overview':
        return <Eye size={12} />;
      case 'detailed':
        return <Layers size={12} />;
      case 'technical':
        return <Activity size={12} />;
      default:
        return <BarChart3 size={12} />;
    }
  };

  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Settings className="text-slate-400" size={16} />
            <span className="text-sm font-medium text-slate-300">View Mode</span>
          </div>
          <Badge className={getPersonaColor(currentPersona.id)}>
            {getPersonaIcon(currentPersona.id)}
            <span className="ml-1">{currentPersona.name}</span>
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {personas.map((persona) => {
            const isActive = currentPersona.id === persona.id;
            return (
              <Button
                key={persona.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onPersonaChange(persona)}
                className={`flex items-center gap-2 justify-start h-auto p-3 ${
                  isActive
                    ? getPersonaColor(persona.id)
                    : 'border-slate-600 bg-slate-800/30 text-slate-400 hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {getPersonaIcon(persona.id)}
                  <div className="text-left">
                    <div className="text-xs font-medium">{persona.name}</div>
                    <div className="text-xs opacity-70">{persona.role}</div>
                  </div>
                </div>
                
                {isActive && (
                  <div className="ml-auto flex items-center gap-1">
                    {getViewIcon(persona.preferences.preferredView)}
                    <span className="text-xs capitalize">
                      {persona.preferences.preferredView}
                    </span>
                  </div>
                )}
              </Button>
            );
          })}
        </div>

        {/* Persona Preferences */}
        <div className="mt-3 pt-3 border-t border-slate-700">
          <div className="text-xs text-slate-400 mb-2">Current View Settings:</div>
          <div className="flex flex-wrap gap-2">
            {currentPersona.preferences.showTechnicalDetails && (
              <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-300">
                Technical Details
              </Badge>
            )}
            {currentPersona.preferences.showProcessingMetrics && (
              <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-300">
                Processing Metrics
              </Badge>
            )}
            <Badge variant="outline" className="text-xs border-slate-500/30 text-slate-300">
              {currentPersona.preferences.preferredView} View
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserPersonaSelector;