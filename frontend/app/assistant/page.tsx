"use client";

import React from "react";
import { AppLayout } from "@/components/AppLayout";
import { ViewContainer } from "@/components/ViewContainer";
import { AgentConsole } from "@/components/AgentConsole";
import { LuBot } from "react-icons/lu";

const AssistantPage: React.FC = () => {
  const handleAgentPrompt = async (message: string) => {
    // For now, return a placeholder response
    // This should be connected to the actual API when analysis is available
    return "Assistant functionality will be available when you upload a document for analysis.";
  };

  return (
    <AppLayout>
      <div className="p-6">
        <ViewContainer
          icon={LuBot}
          title="AI Assistant"
          subtitle="Intelligent analysis and research support"
        >
          <AgentConsole analysisId={null} onSend={handleAgentPrompt} />
        </ViewContainer>
      </div>
    </AppLayout>
  );
};

export default AssistantPage;
