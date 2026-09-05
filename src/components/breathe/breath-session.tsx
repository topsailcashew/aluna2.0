"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX, X } from "lucide-react";

import { Grounding } from "@/components/breathe/grounding";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { BreathAudio } from "@/lib/breath-audio";
import {
  cycleSeconds,
  type BreathPattern,
  type BreathPhase,
} from "@/lib/data/breath-patterns";
import { cn } from "@/lib/utils";

interface BreathSessionProps {
  pattern: BreathPattern;
  minutes: number;
  onClose: () => void;
}

interface Frame {
  phase: BreathPhase;
  phaseIndex: number;
  /** 0 → 1 through the current phase. */
  progress: number;
  /** Whole seconds left in this phase, counting down from its length. */
  remaining: number;
  cycle: number;
  elapsed: number;
}

/** Where the orb sits at the end of each phase kind. */
const SCALE = { min: 0.42, max: 1 };

function scaleFor(phase: BreathPhase, progress: number, previousFull: boolean) {
  const eased = 0.5 - Math.cos(Math.PI * progress) / 2; // ease-in-out
  if (phase.kind === "inhale") {
    return SCALE.min + (SCALE.max - SCALE.min) * eased;
  }
  if (phase.kind === "exhale") {
    return SCALE.max - (SCALE.max - SCALE.min) * eased;
  }
  // A hold keeps whatever size the previous phase left behind.
  return previousFull ? SCALE.max : SCALE.min;
}

export function BreathSession({
  pattern,
  minutes,
  onClose,
}: BreathSessionProps) {
  const totalSeconds = minutes * 60;
  const loop = cycleSeconds(pattern);

  const [frame, setFrame] = useState<Frame>(() => ({
    phase: pattern.phases[0],
    phaseIndex: 0,
    progress: 0,
    remaining: pattern.phases[0].seconds,
    cycle: 1,
    elapsed: 0,
  }));
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [done, setDone] = useState(false);
  // Breathwork settles the body; grounding puts attention outside the head,
  // which is the half that keeps it settled.
  const [grounding, setGrounding] = useState(false);

  const audioRef = useRef<BreathAudio | null>(null);
  // Wall-clock bookkeeping: `elapsed` accumulates only while running, so
  // pausing genuinely stops the session rather than letting it drift on.
  const elapsedRef = useRef(0);
  const lastPhaseRef = useRef<number>(-1);
  const reduceMotion = usePrefersReducedMotion();

  // Audio has to be created inside the gesture that opened this view; the
  // parent only mounts the session on a tap, so this effect still counts.
  useEffect(() => {
    const audio = new BreathAudio();
    audioRef.current = audio;
    void audio.start().then(() => {
      audio.startPad();
      audio.cue(pattern.phases[0].kind, pattern.phases[0].seconds);
      lastPhaseRef.current = 0;
    });

    return () => {
      void audio.stop();
      audioRef.current = null;
    };
  }, [pattern]);

  useEffect(() => {
    audioRef.current?.setMuted(muted);
  }, [muted]);

  // Paused/done are read from inside the animation loop, so they live in refs
  // as well as state: keeping them in the loop's dependency list would tear
  // down and rebuild the rAF chain on every pause.
  const pausedRef = useRef(false);
  const doneRef = useRef(false);

  const togglePaused = () => {
    setPaused((value) => {
      pausedRef.current = !value;
      return !value;
    });
  };

  useEffect(() => {
    let raf = 0;
    let last: number | null = null;

    const step = (now: number) => {
      if (last === null) last = now;
      const delta = (now - last) / 1000;
      last = now;

      if (!pausedRef.current && !doneRef.current) elapsedRef.current += delta;
      const elapsed = elapsedRef.current;

      if (elapsed >= totalSeconds && !doneRef.current) {
        doneRef.current = true;
        setDone(true);
        audioRef.current?.finish();
        return;
      }
      if (doneRef.current) return;

      // Walk the phase list to find where this moment falls in the cycle.
      const intoCycle = elapsed % loop;
      let running = 0;
      let phaseIndex = 0;
      for (let i = 0; i < pattern.phases.length; i += 1) {
        const next = running + pattern.phases[i].seconds;
        if (intoCycle < next) {
          phaseIndex = i;
          break;
        }
        running = next;
      }

      const phase = pattern.phases[phaseIndex];
      const intoPhase = intoCycle - running;

      if (phaseIndex !== lastPhaseRef.current) {
        lastPhaseRef.current = phaseIndex;
        audioRef.current?.cue(phase.kind, phase.seconds);
      }

      setFrame({
        phase,
        phaseIndex,
        progress: Math.min(1, intoPhase / phase.seconds),
        remaining: Math.max(1, Math.ceil(phase.seconds - intoPhase)),
        cycle: Math.floor(elapsed / loop) + 1,
        elapsed,
      });

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [totalSeconds, loop, pattern.phases]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === " ") {
        event.preventDefault();
        setPaused((value) => {
          pausedRef.current = !value;
          return !value;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const previousFull =
    frame.phaseIndex > 0 &&
    pattern.phases[frame.phaseIndex - 1].kind === "inhale";
  const rawScale = scaleFor(frame.phase, frame.progress, previousFull);
  // Reduced motion still breathes, just far less.
  const scale = reduceMotion ? 0.8 + (rawScale - 0.42) * 0.18 : rawScale;

  const remainingTotal = Math.max(0, Math.ceil(totalSeconds - frame.elapsed));
  const minutesLeft = Math.floor(remainingTotal / 60);
  const secondsLeft = remainingTotal % 60;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label={`${pattern.name} session`}
      style={{
        background: `radial-gradient(120% 80% at 50% 30%, ${pattern.accent}2e, transparent 60%), var(--canvas)`,
      }}
    >
      <header className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <div>
          <p className="text-sm font-extrabold text-ink">{pattern.name}</p>
          <p className="text-xs text-ink-muted" aria-live="off">
            {done
              ? "Complete"
              : `${minutesLeft}:${String(secondsLeft).padStart(2, "0")} left · cycle ${frame.cycle}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="End session"
          className="grid size-10 place-items-center rounded-full bg-surface/70 text-ink shadow-card backdrop-blur transition-colors hover:bg-surface"
        >
          <X className="size-4" aria-hidden />
        </button>
      </header>

      {grounding ? (
        <Grounding accent={pattern.accent} onDone={onClose} />
      ) : (
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
        <div className="relative grid h-[19rem] w-[19rem] place-items-center">
          {/* Four dots mark the corners a box pattern travels through; other
              patterns get a plain guide ring. */}
          <span
            aria-hidden
            className="absolute inset-0 rounded-full border"
            style={{ borderColor: `${pattern.accent}33` }}
          />
          <span
            aria-hidden
            className="absolute rounded-full transition-transform duration-100 ease-linear"
            style={{
              width: "19rem",
              height: "19rem",
              transform: `scale(${scale})`,
              background: `radial-gradient(circle at 50% 40%, ${pattern.accent}cc, ${pattern.accent}66)`,
              boxShadow: `0 20px 60px -20px ${pattern.accent}99`,
            }}
          />

          <div className="relative text-center">
            {done ? (
              <p className="text-2xl font-extrabold text-white drop-shadow">
                Well done
              </p>
            ) : (
              <>
                <p
                  className="text-xl font-extrabold text-white drop-shadow"
                  aria-live="polite"
                >
                  {frame.phase.label}
                </p>
                <p className="mt-1 text-4xl font-black tabular-nums text-white drop-shadow">
                  {frame.remaining}
                </p>
              </>
            )}
          </div>
        </div>

        {done ? (
          <div className="space-y-4 text-center">
            <p className="max-w-[30ch] text-sm leading-relaxed text-ink-muted">
              {minutes} minute{minutes === 1 ? "" : "s"} of {pattern.name.toLowerCase()}.
              Notice how the next breath arrives on its own.
            </p>
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => setGrounding(true)}
                className="rounded-2xl px-6 py-3 text-sm font-bold text-white"
                style={{ backgroundColor: pattern.accent }}
              >
                Now ground yourself
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-ink-muted hover:text-ink"
              >
                Finish here
              </button>
            </div>
          </div>
        ) : (
          <p className="max-w-[32ch] text-center text-xs leading-relaxed text-ink-muted">
            Let the ring lead. If your attention wanders off, that is the
            practice working — come back and carry on.
          </p>
        )}
      </div>

      )}

      {!done && !grounding && (
        <div className="flex items-center justify-center gap-3 px-6 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
          <ControlButton
            onClick={togglePaused}
            label={paused ? "Resume" : "Pause"}
          >
            {paused ? (
              <Play className="size-5" aria-hidden />
            ) : (
              <Pause className="size-5" aria-hidden />
            )}
          </ControlButton>
          <ControlButton
            onClick={() => setMuted((value) => !value)}
            label={muted ? "Unmute" : "Mute"}
            muted={muted}
          >
            {muted ? (
              <VolumeX className="size-5" aria-hidden />
            ) : (
              <Volume2 className="size-5" aria-hidden />
            )}
          </ControlButton>
        </div>
      )}
    </div>
  );
}

function ControlButton({
  onClick,
  label,
  muted,
  children,
}: {
  onClick: () => void;
  label: string;
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "grid size-14 place-items-center rounded-full shadow-card backdrop-blur transition-colors",
        muted
          ? "bg-surface-sunken text-ink-subtle"
          : "bg-surface/80 text-ink hover:bg-surface",
      )}
    >
      {children}
    </button>
  );
}
