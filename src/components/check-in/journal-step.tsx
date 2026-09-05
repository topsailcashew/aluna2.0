"use client";

import { JOURNAL_PROMPTS } from "@/lib/data/context-tags";
import { Textarea } from "@/components/ui/textarea";
import type { JournalAnswers } from "@/lib/types";

interface JournalStepProps {
  journal: JournalAnswers;
  onChange: (next: JournalAnswers) => void;
}

/**
 * Three prompts, all optional. They ask about the situation rather than about
 * the person — "what did you need" instead of "what should you have done" —
 * because the point is noticing, not grading yourself.
 */
export function JournalStep({ journal, onChange }: JournalStepProps) {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-display text-ink">
          Anything you want to say about it?
        </h2>
        <p className="text-sm text-ink-muted">
          All three are optional, and a single line is a complete answer. Nobody
          reads this but you — it is encrypted before it leaves the device.
        </p>
      </header>

      <div className="space-y-5">
        {JOURNAL_PROMPTS.map((prompt) => (
          <div key={prompt.id} className="space-y-1.5">
            <Textarea
              label={prompt.question}
              optional
              maxLength={2000}
              value={journal[prompt.id] ?? ""}
              onChange={(event) =>
                onChange({ ...journal, [prompt.id]: event.target.value })
              }
              placeholder={prompt.hint}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
