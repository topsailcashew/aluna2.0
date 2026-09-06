"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";

import { BodyMap } from "@/components/check-in/body-map";
import { Button } from "@/components/ui/button";
import { IntensitySlider } from "@/components/ui/intensity-slider";
import { Textarea } from "@/components/ui/textarea";
import {
  BODY_PARTS,
  BODY_REGION_LABELS,
  bodyPartLabel,
  type BodyRegion,
} from "@/lib/data/body-parts";
import {
  MAX_NOTE_LENGTH,
  MAX_SENSATIONS,
  type LoggedSensation,
} from "@/lib/schemas";
import { clientId, cn } from "@/lib/utils";

const REGION_ORDER: BodyRegion[] = ["head", "torso", "arms", "legs", "whole"];

/**
 * Colour ramp mirroring the intensity slider. One hue per band, mixed against
 * the current surface by `.tone-surface`, so the pills follow the theme.
 */
function intensityTone(intensity: number) {
  if (intensity <= 2) return "#4a9aad";
  if (intensity <= 5) return "#e0a458";
  if (intensity <= 7) return "#e0776f";
  return "#d1504a";
}

interface SensationStepProps {
  sensations: LoggedSensation[];
  onChange: (next: LoggedSensation[]) => void;
}

export function SensationStep({ sensations, onChange }: SensationStepProps) {
  const [region, setRegion] = useState<BodyRegion>("head");
  const [bodyPart, setBodyPart] = useState<string | null>(null);

  // Retains the last chosen part so the panel keeps its wording while it
  // collapses shut, instead of blanking out mid-animation.
  const [panelPart, setPanelPart] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState("");

  const selectPart = (id: string | null) => {
    setBodyPart(id);
    if (id) setPanelPart(id);
  };

  const partsInRegion = useMemo(
    () => BODY_PARTS.filter((part) => part.region === region),
    [region],
  );

  const loggedRegions = useMemo(() => {
    const regions = new Set<BodyRegion>();
    for (const sensation of sensations) {
      const part = BODY_PARTS.find((p) => p.id === sensation.bodyPart);
      if (part) regions.add(part.region);
    }
    return regions;
  }, [sensations]);

  const atCapacity = sensations.length >= MAX_SENSATIONS;

  const addSensation = () => {
    if (!bodyPart || atCapacity) return;
    onChange([
      ...sensations,
      { id: clientId(), bodyPart, intensity, note: note.trim() },
    ]);
    // Keep the region open — people usually log a few nearby spots at once.
    setBodyPart(null);
    setIntensity(5);
    setNote("");
  };

  const removeSensation = (id: string) => {
    onChange(sensations.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-display text-ink">
          Where does your body speak?
        </h2>
        <p className="text-sm text-ink-muted">
          Anywhere holding something — tightness, warmth, a buzz. Skipping is
          fine.
        </p>
      </header>

      {/* Compact body — a calm anchor and a map of what's already logged. */}
      <div className="mx-auto w-20">
        <BodyMap
          activeRegion={region}
          onRegionChange={(next) => {
            setRegion(next);
            selectPart(null);
          }}
          loggedRegions={loggedRegions}
        />
      </div>

      {/* Area — every region visible, wrapping down the page, never sideways. */}
      <div className="space-y-2">
        <p className="px-1 text-xs font-semibold text-ink-muted">Pick an area</p>
        <div className="flex flex-wrap gap-2">
          {REGION_ORDER.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setRegion(item);
                selectPart(null);
              }}
              aria-pressed={region === item}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-bold transition-colors",
                region === item
                  ? "bg-[var(--marker)] text-[var(--marker-ink)]"
                  : "bg-surface-sunken text-ink-muted hover:text-ink",
              )}
            >
              {BODY_REGION_LABELS[item]}
            </button>
          ))}
        </div>
      </div>

      {/* Where exactly — full width, wraps to new lines. */}
      <div className="space-y-2">
        <p className="px-1 text-xs font-semibold text-ink-muted">Where exactly?</p>
        <div
          role="radiogroup"
          aria-label={`Body parts in ${BODY_REGION_LABELS[region]}`}
          className="flex flex-wrap gap-2"
        >
          {partsInRegion.map((part) => {
            const isSelected = bodyPart === part.id;
            const alreadyLogged = sensations.some(
              (s) => s.bodyPart === part.id,
            );
            return (
              <button
                key={part.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => selectPart(isSelected ? null : part.id)}
                className={cn(
                  "rounded-2xl border px-3.5 py-2 text-sm font-semibold transition-all",
                  isSelected
                    ? "border-transparent bg-[var(--marker)] text-[var(--marker-ink)] shadow-[0_8px_18px_-12px_rgb(16_68_82/0.9)]"
                    : "border-line bg-surface text-ink hover:border-deep-300",
                )}
              >
                {part.label}
                {alreadyLogged && !isSelected && (
                  <span
                    aria-hidden
                    className="ml-1.5 inline-block size-1.5 rounded-full bg-happy align-middle"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* A grid-rows collapse rather than an animated height: no measuring,
          and it settles correctly even if the tab never gets a paint. */}
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
          bodyPart ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
        aria-hidden={!bodyPart}
      >
        <div className="overflow-hidden">
          {panelPart && (
            <div className="card space-y-4 p-4">
              <p className="text-sm font-bold text-ink">
                How strong is it in your{" "}
                <span className="text-deep-600 dark:text-deep-300">
                  {bodyPartLabel(panelPart).toLowerCase()}
                </span>
                ?
              </p>

              <IntensitySlider
                value={intensity}
                onChange={setIntensity}
                disabled={!bodyPart}
              />

              <Textarea
                label="Descriptive notes"
                optional
                maxLength={MAX_NOTE_LENGTH}
                value={note}
                disabled={!bodyPart}
                onChange={(event) => setNote(event.target.value)}
                placeholder="A dull ache that shows up when I hold my breath…"
              />

              <Button
                onClick={addSensation}
                fullWidth
                disabled={!bodyPart || atCapacity}
              >
                <Plus className="size-4" aria-hidden />
                Add this sensation
              </Button>

              {atCapacity && (
                <p className="text-center text-xs font-semibold text-[#d75046]">
                  That is {MAX_SENSATIONS} sensations — plenty for one
                  check-in. Remove one to add another.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <section aria-labelledby="logged-heading" className="space-y-2.5">
        <div className="flex items-baseline justify-between">
          <h3 id="logged-heading" className="text-sm font-bold text-ink">
            Logged sensations
          </h3>
          <span className="text-xs font-semibold text-ink-subtle">
            {sensations.length === 0
              ? "none yet"
              : `${sensations.length} logged${atCapacity ? " (max)" : ""}`}
          </span>
        </div>

        {sensations.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line-strong px-4 py-4 text-center text-xs text-ink-subtle">
            Nothing logged yet — this step is optional.
          </p>
        ) : (
          <ol className="relative space-y-2.5">
            {/* A rail ties the logged spots into the app's timeline motif; the
                intensity node colours each one and the number reads as a stat. */}
            <span
              aria-hidden
              className="pointer-events-none absolute top-3 bottom-3 left-[7px] w-px bg-line"
            />
            <AnimatePresence initial={false} mode="popLayout">
              {sensations.map((sensation) => {
                const tone = intensityTone(sensation.intensity);
                return (
                  <motion.li
                    key={sensation.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    className="relative pl-7"
                    style={{ "--tone": tone } as CSSProperties}
                  >
                    <span
                      aria-hidden
                      className="absolute top-1/2 left-0 grid w-[15px] -translate-y-1/2 place-items-center"
                    >
                      <span
                        className="size-2.5 rounded-full ring-4 ring-[var(--surface)]"
                        style={{ backgroundColor: tone }}
                      />
                    </span>

                    <div className="tone-surface flex items-center gap-3 rounded-2xl py-2.5 pr-2 pl-3.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">
                          {bodyPartLabel(sensation.bodyPart)}
                        </p>
                        {sensation.note && (
                          <p className="truncate text-xs opacity-70">
                            {sensation.note}
                          </p>
                        )}
                      </div>

                      <span className="flex items-baseline gap-0.5">
                        <span className="stat text-xl">
                          {sensation.intensity}
                        </span>
                        <span className="text-[10px] font-semibold opacity-60">
                          / 10
                        </span>
                      </span>

                      <button
                        type="button"
                        onClick={() => removeSensation(sensation.id)}
                        aria-label={`Remove ${bodyPartLabel(sensation.bodyPart)} sensation`}
                        className="grid size-7 shrink-0 place-items-center rounded-full bg-surface/60 transition-colors hover:bg-surface"
                      >
                        <X className="size-3.5" strokeWidth={3} aria-hidden />
                      </button>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ol>
        )}
      </section>
    </div>
  );
}
