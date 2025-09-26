"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle,
  BookOpen,
  Video,
  MessageSquare,
  Mail,
  ExternalLink,
  Search,
  Lightbulb,
  Settings,
  Code,
  Users,
} from "lucide-react";

export default function HelpPage() {
  const helpSections = [
    {
      title: "Getting Started",
      icon: Lightbulb,
      items: [
        {
          title: "Quick Start Guide",
          description: "Learn the basics of CORE in 5 minutes",
          type: "guide",
        },
        {
          title: "Upload Your First Document",
          description: "Step-by-step tutorial for document analysis",
          type: "tutorial",
        },
        {
          title: "Understanding Insights",
          description: "How to interpret novelty, competitive, and market analysis",
          type: "guide",
        },
      ],
    },
    {
      title: "Features & Tools",
      icon: Settings,
      items: [
        {
          title: "Tech Transfer Analyzer",
          description: "Comprehensive research evaluation and IP analysis",
          type: "feature",
        },
        {
          title: "VC Lens Dashboard",
          description: "Startup evaluation and investment insights",
          type: "feature",
        },
        {
          title: "GTM Lab",
          description: "Product development and go-to-market strategy",
          type: "feature",
        },
        {
          title: "AI Assistant",
          description: "Interactive chat for research and business questions",
          type: "feature",
        },
      ],
    },
    {
      title: "Developer Resources",
      icon: Code,
      items: [
        {
          title: "API Documentation",
          description: "Complete API reference and integration guides",
          type: "docs",
        },
        {
          title: "Developer Tools",
          description: "Debug mode, performance metrics, and testing tools",
          type: "tools",
        },
        {
          title: "SDK & Libraries",
          description: "Official SDKs for popular programming languages",
          type: "code",
        },
      ],
    },
    {
      title: "Support & Community",
      icon: Users,
      items: [
        {
          title: "Contact Support",
          description: "Get help from our technical support team",
          type: "support",
        },
        {
          title: "Community Forum",
          description: "Connect with other researchers and developers",
          type: "community",
        },
        {
          title: "Feature Requests",
          description: "Suggest new features and improvements",
          type: "feedback",
        },
      ],
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "guide":
        return <BookOpen className="h-4 w-4" />;
      case "tutorial":
        return <Video className="h-4 w-4" />;
      case "feature":
        return <Settings className="h-4 w-4" />;
      case "docs":
        return <BookOpen className="h-4 w-4" />;
      case "tools":
        return <Code className="h-4 w-4" />;
      case "code":
        return <Code className="h-4 w-4" />;
      case "support":
        return <Mail className="h-4 w-4" />;
      case "community":
        return <MessageSquare className="h-4 w-4" />;
      case "feedback":
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      guide: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      tutorial: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      feature: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      docs: "bg-orange-500/20 text-orange-300 border-orange-500/30",
      tools: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      code: "bg-pink-500/20 text-pink-300 border-pink-500/30",
      support: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      community: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      feedback: "bg-green-500/20 text-green-300 border-green-500/30",
    };

    return (
      <Badge
        variant="outline"
        className={`${colors[type as keyof typeof colors] || colors.guide} capitalize`}
      >
        {type}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-3 mb-4">
              <HelpCircle className="h-8 w-8 text-emerald-400" />
              Help & Documentation
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Everything you need to know about using CORE for research evaluation,
              tech transfer, and commercialization insights.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-slate-900/50 border-slate-700 hover:border-emerald-500/50 transition-colors cursor-pointer">
            <CardHeader className="text-center">
              <Search className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
              <CardTitle className="text-white">Search Documentation</CardTitle>
              <CardDescription className="text-slate-400">
                Find answers to your questions quickly
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 hover:border-emerald-500/50 transition-colors cursor-pointer">
            <CardHeader className="text-center">
              <MessageSquare className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
              <CardTitle className="text-white">Contact Support</CardTitle>
              <CardDescription className="text-slate-400">
                Get help from our expert team
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 hover:border-emerald-500/50 transition-colors cursor-pointer">
            <CardHeader className="text-center">
              <Video className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
              <CardTitle className="text-white">Video Tutorials</CardTitle>
              <CardDescription className="text-slate-400">
                Watch step-by-step guides
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Help Sections */}
        <div className="space-y-8">
          {helpSections.map((section, sectionIndex) => {
            const SectionIcon = section.icon;
            return (
              <Card key={sectionIndex} className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3">
                    <SectionIcon className="h-6 w-6 text-emerald-400" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {section.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-emerald-500/50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(item.type)}
                            <h3 className="font-medium text-white group-hover:text-emerald-400 transition-colors">
                              {item.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            {getTypeBadge(item.type)}
                            <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                          </div>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Contact Section */}
        <Card className="bg-slate-900/50 border-slate-700 mt-12">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-2xl mb-2">
              Still Need Help?
            </CardTitle>
            <CardDescription className="text-slate-400 text-lg">
              Our support team is here to help you succeed with CORE
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-6 bg-slate-800/50 rounded-lg">
                <Mail className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
                <h3 className="font-medium text-white mb-2">Email Support</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Get detailed help via email
                </p>
                <p className="text-emerald-400 font-medium">support@core-ai.com</p>
              </div>
              <div className="text-center p-6 bg-slate-800/50 rounded-lg">
                <MessageSquare className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
                <h3 className="font-medium text-white mb-2">Live Chat</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Chat with our team in real-time
                </p>
                <p className="text-emerald-400 font-medium">Available 9 AM - 6 PM EST</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}