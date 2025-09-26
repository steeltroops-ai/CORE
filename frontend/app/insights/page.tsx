"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import InsightsIntegrated from "@/components/InsightsIntegrated";
import { Eye } from "lucide-react";

const InsightsPageContent: React.FC = () => {
  const searchParams = useSearchParams();
  const analysisId = searchParams?.get("analysisId");
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(
    analysisId
  );
  const [isUploading, setIsUploading] = useState(false);

  // Handle document upload and create new analysis
  const handleDocumentUpload = async (data: {
    title: string;
    abstract: string;
    body?: string;
    file?: File;
    url?: string;
  }) => {
    setIsUploading(true);

    try {
      // Call the backend ingest endpoint
      const response = await fetch("/api/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title,
          abstract: data.abstract,
          body: data.body || "",
        }),
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      const newAnalysisId = result.analysis_id;

      // Update the current analysis ID
      setCurrentAnalysisId(newAnalysisId);

      // Update the URL with the new analysis ID
      const url = new URL(window.location.href);
      url.searchParams.set("analysisId", newAnalysisId);
      window.history.pushState({}, "", url.toString());
    } catch (error) {
      console.error("Document upload error:", error);
      throw error; // Re-throw to let InsightsIntegrated handle the error display
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InsightsIntegrated
          analysisId={currentAnalysisId}
          onDocumentUpload={handleDocumentUpload}
          isUploading={isUploading}
          className=""
        />
      </div>
    </div>
  );
};

const InsightsPage: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading insights...</p>
          </div>
        </div>
      }
    >
      <InsightsPageContent />
    </Suspense>
  );
};

export default InsightsPage;
