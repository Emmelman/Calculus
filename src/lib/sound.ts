/**
 * Tiny Web Audio sound effects — no asset files, fully offline. The
 * AudioContext is created lazily on first use so it starts after a user
 * gesture (browser autoplay policy). Sounds are skipped when muted.
 */
let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(value: boolean): void {
  enabled = value;
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

function tone(freq: number, start: number, dur: number, gain = 0.18, type: OscillatorType = "sine"): void {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const env = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = ac.currentTime + start;
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(env).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export function playTap(): void {
  if (!enabled) return;
  tone(420, 0, 0.06, 0.08, "triangle");
}

export function playCorrect(): void {
  if (!enabled) return;
  tone(660, 0, 0.12, 0.18, "triangle");
  tone(880, 0.1, 0.16, 0.18, "triangle");
}

export function playWrong(): void {
  if (!enabled) return;
  tone(200, 0, 0.22, 0.16, "sawtooth");
  tone(150, 0.08, 0.22, 0.14, "sawtooth");
}

export function playWin(): void {
  if (!enabled) return;
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => tone(f, i * 0.12, 0.22, 0.2, "triangle"));
}
