"use client";

type StakeholderPanelProps = {
  inventors: string[];

  assignees: string[];

  institutions: string[];
};

export function StakeholderPanel({
  inventors,
  assignees,
  institutions,
}: StakeholderPanelProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StakeholderColumn
        title="Inventors"
        items={inventors}
        empty="No inventors identified yet."
      />

      <StakeholderColumn
        title="Assignees"
        items={assignees}
        empty="No assignees surfaced."
      />

      <StakeholderColumn
        title="Institutions"
        items={institutions}
        empty="No institutions detected."
      />
    </div>
  );
}

function StakeholderColumn({
  title,
  items,
  empty,
}: {
  title: string;
  items: string[];
  empty: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
      <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h4>

      <ul className="mt-3 space-y-2 text-sm text-slate-200">
        {items.map((item) => (
          <li key={item} className="rounded bg-slate-900 px-3 py-2">
            {item}
          </li>
        ))}

        {items.length === 0 && <li className="text-slate-500">{empty}</li>}
      </ul>
    </div>
  );
}
