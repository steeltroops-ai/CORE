"use client";

type ScoreGridProps = {
  novelty: number;

  scores?: Record<string, number>;
};

const LABELS: Record<string, string> = {
  novelty: "Novelty",

  ip_defensibility: "IP Defensibility",

  market: "Market",

  team: "Team",

  scalability: "Scalability",
};

function formatScore(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function ScoreGrid({ novelty, scores }: ScoreGridProps) {
  const merged = {
    novelty,

    ...(scores ?? {}),
  } as Record<string, number>;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {Object.entries(merged).map(([key, value]) => (
        <div
          key={key}
          className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 shadow"
        >
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {LABELS[key] ?? key}
          </p>

          <p className="mt-2 text-2xl font-semibold text-emerald-300">
            {typeof value === "number" ? formatScore(value) : "-"}
          </p>

          {key === "novelty" && (
            <p className="mt-1 text-xs text-slate-400">
              Lower similarity scores imply higher novelty.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
