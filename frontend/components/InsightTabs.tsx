"use client";

import { useState } from "react";

const TABS = [
  { key: "patents", label: "Patent Radar" },

  { key: "stakeholders", label: "Stakeholder Map" },

  { key: "vc", label: "VC Dashboard" },

  { key: "gtm", label: "GTM Studio" },
];

type InsightTabsProps = {
  analysis: any | null;
};

export function InsightTabs({ analysis }: InsightTabsProps) {
  const [activeTab, setActiveTab] = useState(TABS[0].key);

  return (
    <section className="rounded-lg bg-slate-900/60 p-6 shadow">
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`rounded px-3 py-1 text-sm font-medium transition ${
              activeTab === tab.key
                ? "bg-emerald-500 text-slate-950"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4 text-sm text-slate-300">
        {!analysis && <p>Submit research to populate insights.</p>}

        {analysis && activeTab === "patents" && (
          <div>
            <h3 className="text-lg font-semibold text-slate-100">
              Patent Radar
            </h3>

            <p className="mt-2">
              Novelty score:{" "}
              <span className="font-semibold text-emerald-300">
                {analysis.novelty_score}
              </span>
            </p>

            <p className="mt-2">
              Related patents will appear here once Logic Mill integration is
              live.
            </p>
          </div>
        )}

        {analysis && activeTab === "stakeholders" && (
          <div>
            <h3 className="text-lg font-semibold text-slate-100">
              Stakeholder Map
            </h3>

            <p className="mt-2">
              Competitor and collaborator entities will render in this view.
            </p>
          </div>
        )}

        {analysis && activeTab === "vc" && (
          <div>
            <h3 className="text-lg font-semibold text-slate-100">
              VC Dashboard
            </h3>

            <pre className="mt-2 whitespace-pre-wrap rounded bg-slate-950/60 p-4 text-slate-200">
              {JSON.stringify(analysis.scores ?? {}, null, 2)}
            </pre>
          </div>
        )}

        {analysis && activeTab === "gtm" && (
          <div>
            <h3 className="text-lg font-semibold text-slate-100">GTM Studio</h3>

            <p className="mt-2">
              Product hypotheses and narration scripts will surface here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
