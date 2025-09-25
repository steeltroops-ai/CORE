"use client";

import { useState } from "react";

type AgentConsoleProps = {
  analysisId: string | null;

  onSend: (message: string) => Promise<string>;
};

export function AgentConsole({ analysisId, onSend }: AgentConsoleProps) {
  const [message, setMessage] = useState("");

  const [conversation, setConversation] = useState<string[]>([]);

  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!analysisId) {
      return;
    }

    setIsSending(true);

    const reply = await onSend(message);

    setConversation((history) => [
      ...history,

      `You: ${message}`,

      `Agent: ${reply}`,
    ]);

    setMessage("");

    setIsSending(false);
  }

  return (
    <section className="rounded-lg bg-slate-900/60 p-6 shadow">
      <h2 className="text-xl font-semibold">Interactive Agent</h2>

      {!analysisId && (
        <p className="mt-2 text-sm text-slate-300">
          Submit research to activate the agent.
        </p>
      )}

      {analysisId && (
        <>
          <div className="mt-4 space-y-2 rounded border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-200">
            {conversation.length === 0 && (
              <p>Ask the agent about novelty, licensing, or GTM strategy.</p>
            )}

            {conversation.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <input
              className="flex-1 rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask a question"
            />

            <button
              type="submit"
              className="rounded bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              disabled={isSending}
            >
              {isSending ? "Thinking..." : "Send"}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
