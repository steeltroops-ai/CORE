"use client";

type LicensingListProps = {
  opportunities: string[];
};

export function LicensingList({ opportunities }: LicensingListProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        Licensing Opportunities
      </h4>

      <ul className="mt-3 space-y-2 text-sm text-slate-200">
        {opportunities.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="rounded bg-slate-900 px-3 py-2"
          >
            {item}
          </li>
        ))}

        {opportunities.length === 0 && (
          <li className="text-slate-500">
            No licensing leads yet. Run analysis first.
          </li>
        )}
      </ul>
    </div>
  );
}
