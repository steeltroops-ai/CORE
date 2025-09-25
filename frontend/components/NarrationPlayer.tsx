"use client";

type NarrationPlayerProps = {
  status: "idle" | "pending" | "ready";

  audioUrl?: string | null;

  onGenerate: () => Promise<void>;
};

export function NarrationPlayer({
  status,
  audioUrl,
  onGenerate,
}: NarrationPlayerProps) {
  return (
    <section className="rounded-lg bg-slate-900/60 p-6 shadow">
      <h2 className="text-xl font-semibold">Narrated Pitch</h2>

      <p className="mt-2 text-sm text-slate-300">
        Trigger ElevenLabs narration to deliver a two-minute CORE pitch during
        judging.
      </p>

      <div className="mt-4 flex items-center gap-4">
        <button
          className="rounded bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          onClick={onGenerate}
          disabled={status === "pending"}
        >
          {status === "pending" ? "Generating audio..." : "Generate narration"}
        </button>

        <span className="text-xs uppercase tracking-wide text-slate-400">
          Status: {status}
        </span>
      </div>

      {audioUrl && (
        <audio className="mt-4 w-full" controls src={audioUrl}>
          Your browser does not support the audio element.
        </audio>
      )}
    </section>
  );
}
