"use client";

const STEPS = [
  { key: "ingest", label: "Ingest" },

  { key: "retrieve", label: "Retrieve" },

  { key: "analyze", label: "Analyze" },

  { key: "narrate", label: "Narrate" },
];

type StatusStepperProps = {
  activeStep: string;
};

export function StatusStepper({ activeStep }: StatusStepperProps) {
  return (
    <ol className="flex flex-wrap gap-2 text-sm">
      {STEPS.map((step) => {
        const isActive = step.key === activeStep;

        return (
          <li
            key={step.key}
            className={`flex items-center gap-2 rounded-full border px-3 py-1 ${
              isActive
                ? "border-emerald-400 bg-emerald-500/10 text-emerald-300"
                : "border-slate-700 bg-slate-900 text-slate-400"
            }`}
          >
            <span className="inline-block h-2 w-2 rounded-full bg-current" />

            {step.label}
          </li>
        );
      })}
    </ol>
  );
}
