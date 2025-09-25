"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BarChart3,
  Network,
  Briefcase,
  Brain,
  Zap,
  ExternalLink,
  FileText,
  Upload,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const DemoPage: React.FC = () => {
  const [sampleAnalysisId] = useState("demo-analysis-123");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              CORE Platform - Track 1 Demo
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the comprehensive Track 1 Tech Transfer Insights
              powered by Claude AI and Max Planck Logic Mill
            </p>
            <div className="flex justify-center mt-6">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 px-4 py-2"
              >
                <Zap className="h-4 w-4 mr-2" />
                AI-Powered Analysis Platform
              </Badge>
            </div>
          </div>

          {/* Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span>Novelty Assessment</span>
                </CardTitle>
                <CardDescription>
                  Advanced patent similarity analysis with confidence intervals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Similarity scoring</li>
                  <li>• Prior art landscape</li>
                  <li>• Freedom-to-operate risk</li>
                  <li>• Claims analysis</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Network className="h-5 w-5 text-purple-600" />
                  <span>Competitive Intelligence</span>
                </CardTitle>
                <CardDescription>
                  Comprehensive competitive landscape analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Inventor networks</li>
                  <li>• Institution mapping</li>
                  <li>• Patent portfolios</li>
                  <li>• Collaboration networks</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5 text-green-600" />
                  <span>Commercialization</span>
                </CardTitle>
                <CardDescription>
                  Market readiness and licensing opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Licensing leads</li>
                  <li>• Market readiness</li>
                  <li>• IP roadmap</li>
                  <li>• Revenue potential</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-indigo-600" />
                  <span>Strategic Insights</span>
                </CardTitle>
                <CardDescription>
                  AI-powered recommendations and risk assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• AI recommendations</li>
                  <li>• Risk assessment</li>
                  <li>• Market timing</li>
                  <li>• Partnership opportunities</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Demo Access */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Experience Track 1 Insights
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Click below to explore a comprehensive Track 1 analysis with
                sample data showcasing all four insight categories.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href={`/insights?analysisId=${sampleAnalysisId}`}
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <BarChart3 className="h-5 w-5" />
                <span>View Track 1 Demo</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <div className="text-sm text-gray-500">
                Analysis ID: {sampleAnalysisId}
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Technical Implementation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Backend Services
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Enhanced Logic Mill service with advanced analytics</li>
                  <li>• Claude AI integration for strategic insights</li>
                  <li>• Comprehensive API endpoints for all insight types</li>
                  <li>• Real-time data processing and analysis</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Frontend Features
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Interactive React components with TypeScript</li>
                  <li>• Responsive design with Tailwind CSS</li>
                  <li>• Custom data visualizations and charts</li>
                  <li>• Professional UI with optimal white space</li>
                </ul>
              </div>
            </div>
          </div>

          {/* API Information */}
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <strong>API Endpoints:</strong> The Track 1 insights are
              accessible via RESTful APIs at
              <code className="bg-gray-100 px-1 rounded">
                /api/analysis/&#123;analysisId&#125;/track1/&#123;endpoint&#125;
              </code>
              including novelty, competitive, commercialization, and strategic
              endpoints.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;
