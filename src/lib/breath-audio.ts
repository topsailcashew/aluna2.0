/**
 * Sound for a breathing session, synthesised rather than loaded.
 *
 * The first version glided a sine between two pitches with a bright fifth on
 * top, which read as cartoonish — a pitch sweep is a "boing", and the fifth
 * put it in a register that draws attention rather than releasing it. This
 * one drops the glide entirely and works two quieter ideas instead:
 *
 *   1. Filtered noise that swells and fades with the breath. Non-pitched, so
 *      it reads as air rather than as a note.
 *   2. A singing-bowl strike at each turn — a low fundamental with two quiet
 *      inharmonic partials, low-passed, with a slow attack and a long tail.
 *
 * Everything sits below 2 kHz, and nothing starts abruptly.
 *
 * The context is created on the first user gesture (pressing Begin), which is
 * what browser autoplay policies require.
 */

import type { BreathPhaseKind } from "@/lib/data/breath-patterns";

/** Fundamentals a minor third apart — settled, and never bright. */
const BOWL_HZ: Record<BreathPhaseKind, number> = {
  inhale: 220.0,
  hold: 174.61,
  exhale: 164.81,
};

/** Real bowls ring slightly out of tune with themselves; that is the character. */
const PARTIALS = [
  { ratio: 1, gain: 1 },
  { ratio: 2.01, gain: 0.22 },
  { ratio: 2.97, gain: 0.09 },
];

export class BreathAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private pad: { osc: OscillatorNode[]; gain: GainNode } | null = null;
  private breath: { source: AudioBufferSourceNode; gain: GainNode } | null =
    null;

  /** Must be called from inside a user-gesture handler. */
  async start(): Promise<void> {
    if (!this.context) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return;

      this.context = new Ctor();
      this.master = this.context.createGain();
      this.master.gain.value = 0.9;

      // A gentle ceiling on brightness across everything the session plays.
      const shelf = this.context.createBiquadFilter();
      shelf.type = "lowpass";
      shelf.frequency.value = 2200;
      shelf.Q.value = 0.5;

      this.master.connect(shelf).connect(this.context.destination);
      this.noise = this.createNoiseBuffer(this.context);
    }
    // Safari and Chrome both park the context until a gesture resumes it.
    if (this.context.state === "suspended") await this.context.resume();
  }

  get available(): boolean {
    return this.context !== null;
  }

  /** Two seconds of pink-ish noise, looped. Pink is softer than white. */
  private createNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const length = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Paul Kellet's economical pink-noise approximation.
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.099046;
      b1 = 0.963 * b1 + white * 0.2965164;
      b2 = 0.57 * b2 + white * 1.0526913;
      data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.15;
    }
    return buffer;
  }

  setMuted(muted: boolean) {
    if (!this.master || !this.context) return;
    this.master.gain.cancelScheduledValues(this.context.currentTime);
    this.master.gain.setTargetAtTime(
      muted ? 0 : 0.9,
      this.context.currentTime,
      0.08,
    );
  }

  /** A struck bowl: slow to speak, slow to fade. */
  private bowl(frequency: number, peak: number, decay: number) {
    const ctx = this.context;
    if (!ctx || !this.master) return;
    const now = ctx.currentTime;

    for (const { ratio, gain: partialGain } of PARTIALS) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = frequency * ratio;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      // 180ms attack keeps the onset from clicking or sounding plucked.
      gain.gain.linearRampToValueAtTime(peak * partialGain, now + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(gain).connect(this.master);
      osc.start(now);
      osc.stop(now + decay + 0.1);
    }
  }

  /**
   * Marks the start of a phase: a bowl, plus a noise swell shaped like the
   * breath itself. Holds get the bowl only, very quietly.
   */
  cue(kind: BreathPhaseKind, seconds: number) {
    const ctx = this.context;
    if (!ctx || !this.master || !this.noise) return;

    this.bowl(
      BOWL_HZ[kind],
      kind === "hold" ? 0.035 : 0.075,
      Math.min(seconds, kind === "hold" ? 1.4 : 3.2),
    );

    if (kind === "hold") {
      // Let the previous breath fall away rather than cutting it.
      this.fadeBreath(1.2);
      return;
    }

    this.startBreath(kind, seconds);
  }

  private fadeBreath(over: number) {
    const ctx = this.context;
    if (!ctx || !this.breath) return;
    const { source, gain } = this.breath;
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setTargetAtTime(0, ctx.currentTime, over / 3);
    source.stop(ctx.currentTime + over);
    this.breath = null;
  }

  /** Air moving: amplitude and filter both track the phase. */
  private startBreath(kind: "inhale" | "exhale", seconds: number) {
    const ctx = this.context;
    if (!ctx || !this.master || !this.noise) return;

    this.fadeBreath(0.4);
    const now = ctx.currentTime;

    const source = ctx.createBufferSource();
    source.buffer = this.noise;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    // A low Q keeps it broad and airy instead of whistling.
    filter.Q.value = 0.6;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);

    if (kind === "inhale") {
      // Rising: quiet and dark at the start, fuller and brighter at the top.
      filter.frequency.setValueAtTime(320, now);
      filter.frequency.linearRampToValueAtTime(900, now + seconds);
      gain.gain.linearRampToValueAtTime(0.05, now + seconds * 0.75);
      gain.gain.linearRampToValueAtTime(0.028, now + seconds);
    } else {
      // Falling: starts full, thins out and darkens as the breath empties.
      filter.frequency.setValueAtTime(760, now);
      filter.frequency.linearRampToValueAtTime(240, now + seconds);
      gain.gain.linearRampToValueAtTime(0.045, now + seconds * 0.18);
      gain.gain.linearRampToValueAtTime(0.0001, now + seconds);
    }

    source.connect(filter).connect(gain).connect(this.master);
    source.start(now);
    source.stop(now + seconds + 0.6);

    this.breath = { source, gain };
  }

  /** A low drone under the whole session, so silence never feels like a fault. */
  startPad() {
    const ctx = this.context;
    if (!ctx || !this.master || this.pad) return;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.022, ctx.currentTime + 4);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 420;
    gain.connect(filter).connect(this.master);

    // An open fifth rather than a full chord — no third means no mood.
    const osc = [82.41, 123.47].map((frequency, index) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = frequency;
      o.detune.value = index * 4;
      o.connect(gain);
      o.start();
      return o;
    });

    this.pad = { osc, gain };
  }

  /** Two bowls a fifth apart to close, left to ring out. */
  finish() {
    const ctx = this.context;
    if (!ctx) return;
    this.fadeBreath(1.5);
    this.bowl(164.81, 0.085, 5);
    window.setTimeout(() => this.bowl(246.94, 0.06, 5.5), 700);
  }

  /** Fades everything out and releases the context. */
  async stop(): Promise<void> {
    const ctx = this.context;
    this.fadeBreath(0.5);

    if (this.pad && ctx) {
      const { osc, gain } = this.pad;
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
      osc.forEach((o) => o.stop(ctx.currentTime + 1.8));
      this.pad = null;
    }
    if (ctx) {
      // Give the release tails time to ring out before tearing down.
      window.setTimeout(() => {
        void ctx.close().catch(() => {});
      }, 2500);
    }
    this.context = null;
    this.master = null;
  }
}
