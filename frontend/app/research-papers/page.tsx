"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { ViewContainer } from "@/components/ViewContainer";

import { AnalysisView } from "@/components/AnalysisView";
import { LuUpload } from "react-icons/lu";
import { ingestResearch, AnalysisSummary } from "@/lib/api";

const ResearchPapersPage: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisSummary | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  const handleDocumentUpload = async (data: {
    title: string;
    abstract: string;
    body?: string;
    file?: File;
    url?: string;
  }) => {
    setIsUploading(true);

    try {
      const response = await ingestResearch({
        title: data.title,
        abstract: data.abstract,
        body: data.body,
      });

      setAnalysisId(response.analysis_id);
      // Analysis will be populated through polling or other means
    } catch (error) {
      console.error("Document upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-6">
        <ViewContainer
          icon={LuUpload}
          title="Research Papers"
          subtitle="Upload and analyze research documents"
        >
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
            <LuUpload className="mx-auto mb-4 text-slate-400" size={48} />
            <h3 className="text-lg font-medium text-white mb-2">Upload Research Document</h3>
            <p className="text-slate-400 mb-4">Document upload functionality will be available soon.</p>
          </div>
          {analysis && <AnalysisView analysis={analysis} />}
        </ViewContainer>
      </div>
    </AppLayout>
  );
};

export default ResearchPapersPage;
