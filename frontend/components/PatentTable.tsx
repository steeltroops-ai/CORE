"use client";

type PatentHit = {
  id: string;

  title: string;

  score: number;

  url?: string;

  inventors: string[];

  assignees: string[];

  institutions?: string[];
};

type PatentTableProps = {
  title: string;

  hits: PatentHit[];
};

export function PatentTable({ title, hits }: PatentTableProps) {
  return <DashboardTable title={title} hits={hits} />;
}

function DashboardTable({ title, hits }: PatentTableProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm sm:text-base font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h4>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-xs lg:text-sm min-w-[600px]">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="w-2/5 px-3 py-2 text-left">Title</th>
                <th className="w-1/5 px-3 py-2 text-left">Score</th>
                <th className="w-1/5 px-3 py-2 text-left">Inventors</th>
                <th className="w-1/5 px-3 py-2 text-left">Assignees</th>
              </tr>
            </thead>
            <tbody>
              {hits.map((hit) => (
                <tr
                  key={hit.id}
                  className="border-t border-slate-800 bg-slate-950/80 hover:bg-slate-900/50 transition-colors"
                >
                  <td className="truncate px-3 py-2 text-slate-200">
                    {hit.url ? (
                      <a
                        className="text-emerald-400 underline hover:text-emerald-300 transition-colors"
                        href={hit.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {hit.title}
                      </a>
                    ) : (
                      hit.title
                    )}
                  </td>
                  <td className="px-3 py-2 text-emerald-300 font-medium">
                    {hit.score.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-slate-300">
                    {hit.inventors.length ? hit.inventors.join(", ") : "—"}
                  </td>
                  <td className="px-3 py-2 text-slate-300">
                    {hit.assignees.length ? hit.assignees.join(", ") : "—"}
                  </td>
                </tr>
              ))}
              {hits.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-4 text-center text-slate-500"
                  >
                    No results yet. Submit research to populate this table.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {hits.length === 0 ? (
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 text-center text-slate-500">
            No results yet. Submit research to populate this table.
          </div>
        ) : (
          hits.map((hit) => (
            <div
              key={hit.id}
              className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-3 hover:bg-slate-900/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {hit.url ? (
                    <a
                      className="text-emerald-400 underline hover:text-emerald-300 transition-colors text-sm font-medium leading-tight"
                      href={hit.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {hit.title}
                    </a>
                  ) : (
                    <h5 className="text-slate-200 text-sm font-medium leading-tight">
                      {hit.title}
                    </h5>
                  )}
                </div>
                <div className="flex-shrink-0 bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded text-xs font-medium">
                  {hit.score.toFixed(2)}
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Inventors: </span>
                  <span className="text-slate-300">
                    {hit.inventors.length ? hit.inventors.join(", ") : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Assignees: </span>
                  <span className="text-slate-300">
                    {hit.assignees.length ? hit.assignees.join(", ") : "—"}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
