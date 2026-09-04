"use client";

import { CheckboxCard } from "@/components/ui/checkbox-card";
import { Textarea } from "@/components/ui/textarea";
import { THOUGHT_PATTERNS } from "@/lib/data/thought-patterns";
import { MAX_NOTE_LENGTH } from "@/lib/schemas";

interface ThoughtStepProps {
  patterns: string[];
  note: string;
  onPatternsChange: (next: string[]) => void;
  onNoteChange: (next: string) => void;
}

export function ThoughtStep({
  patterns,
  note,
  onPatternsChange,
  onNoteChange,
}: ThoughtStepProps) {
  const toggle = (id: string, checked: boolean) => {
    onPatternsChange(
      checked ? [...patterns, id] : patterns.filter((value) => value !== id),
    );
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-bold tracking-[0.14em] text-deep-500 uppercase">
          Mind observation
        </p>
        <h2 className="text-2xl font-extrabold tracking-tight text-ink">
          What has your mind been doing?
        </h2>
        <p className="text-sm text-ink-muted">
          These are movements, not mistakes. Tick whatever has been running —
          several at once is normal, and none at all is a valid answer.
        </p>
      </header>

      <fieldset className="space-y-2">
        <legend className="sr-only">Thought patterns</legend>
        {THOUGHT_PATTERNS.map((pattern) => (
          <CheckboxCard
            key={pattern.id}
            checked={patterns.includes(pattern.id)}
            onChange={(checked) => toggle(pattern.id, checked)}
            label={pattern.label}
            hint={pattern.hint}
          />
        ))}
      </fieldset>

      <Textarea
        label="Anything else worth noting"
        optional
        maxLength={MAX_NOTE_LENGTH}
        value={note}
        onChange={(event) => onNoteChange(event.target.value)}
        placeholder="A sentence for the version of you reading this back next month…"
      />
    </div>
  );
}
