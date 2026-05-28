'use client';

import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Clock } from 'lucide-react';
import type { AiringEpisode } from "@repo/anilist";

interface NextAiringBannerProps {
  nextAirEpisode: AiringEpisode;
}

// ── Countdown helpers ─────────────────────────────────────────────────────────

function getSecondsRemaining(airingAt: number): number {
  // airingAt is a Unix timestamp in seconds
  return Math.max(0, airingAt - Math.floor(Date.now() / 1000));
}

function formatCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) return 'Airing now';

  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0 || d > 0) parts.push(`${h}h`);
  parts.push(`${m}m`);
  parts.push(`${String(s).padStart(2, '0')}s`);

  return parts.join(' ');
}

function formatAirDate(airingAtDate: Date): string {
  try {
    return airingAtDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Unknown date';
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function NextAiringBanner({ nextAirEpisode }: NextAiringBannerProps) {
  const { episode, airingAt, airingAtDate } = nextAirEpisode;

  // airingAt must exist to show a countdown
  if (!episode || !airingAt) return null;

  const [open, setOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(() => getSecondsRemaining(airingAt));

  // Tick every second
  useEffect(() => {
    const id = setInterval(() => {
      const remaining = getSecondsRemaining(airingAt);
      setSecondsLeft(remaining);
      if (remaining <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [airingAt]);

  const countdown = formatCountdown(secondsLeft);
  const hasAired = secondsLeft <= 0;

  return (
    <div className="border border-zinc-800 bg-zinc-900/60 overflow-hidden">
      {/* ── Collapsed row (always visible) ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-800/50 transition-colors text-left"
        aria-expanded={open}
        aria-label="Toggle next airing episode details"
      >
        <Clock size={13} className="text-primary shrink-0" />

        <span className="text-[12px] uppercase tracking-widest font-bold text-zinc-400 shrink-0">
          Episode {episode}
        </span>

        <span className="text-zinc-700 text-[12px] shrink-0">—</span>

        <span
          className={`text-[12px] font-bold tabular-nums tracking-wide ${
            hasAired ? 'text-primary' : 'text-zinc-400'
          }`}
        >
          {countdown}
        </span>

        <span className="ml-auto shrink-0 text-zinc-600">
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </span>
      </button>

      {/* ── Expanded details ── */}
      {open && (
        <div className="px-3 pb-3 pt-0.5 border-t border-zinc-800/60">
          <p className="text-primary uppercase text-[14px] font-bold mb-2">
            Upcoming Episode Details
          </p>


              <div className="text-[13px] text-foreground/60 flex gap-2 items-center">
                <span>Episode{' '}</span>
                <span className="font-bold text-foreground/90">{episode}</span>
                {airingAtDate && (
                <span>
                  airing at {formatAirDate(airingAtDate)}
                </span>
              )}
              </div>
            </div>
      )}
    </div>
  );
}