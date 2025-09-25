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
      <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h4>

      <div className="overflow-hidden rounded-lg border border-slate-800">
        <table className="w-full table-fixed border-collapse text-xs">
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
                className="border-t border-slate-800 bg-slate-950/80"
              >
                <td className="truncate px-3 py-2 text-slate-200">
                  {hit.url ? (
                    <a
                      className="text-emerald-400 underline"
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

                <td className="px-3 py-2 text-emerald-300">
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
  );
}
