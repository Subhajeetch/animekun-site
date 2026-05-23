'use client';

import { useState } from 'react';

interface VideoPlayerProps {
  src: string | null;
  title?: string;
  currentEpisode?: number | null;
  episodeTitle?: string;
  autoplay?: boolean;
  onAutoplayChange?: (val: boolean) => void;
  handleEpisodeSelect?: (ep: any, num: number) => void;
  prevEp?: any;
  nextEp?: any;
}

export default function VideoPlayer({
  src,
  title,
  episodeTitle,
  currentEpisode,
  autoplay = true,
  onAutoplayChange,
  handleEpisodeSelect,
  prevEp,
  nextEp,
}: VideoPlayerProps) {
  const [localAutoplay, setLocalAutoplay] = useState(autoplay);

  const iframeSrc = src
    ? `${src}${src.includes('?') ? '&' : '?'}autoplay=${localAutoplay ? 'true' : 'false'}`
    : null;

  const handleAutoplayToggle = () => {
    const next = !localAutoplay;
    setLocalAutoplay(next);
    onAutoplayChange?.(next);
  };

  return (
    <div className="w-full flex flex-col gap-0">
      {/* Player container */}
      <div
        className="relative w-full bg-black border border-zinc-800"
        style={{ aspectRatio: '16/9' }}
        aria-label={`Video player${title ? ` — ${title}` : ''}`}
      >
        {iframeSrc ? (
          <iframe
            key={iframeSrc}
            src={iframeSrc}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={episodeTitle ?? title ?? 'Anime Episode'}
            aria-label={`Playing: ${episodeTitle ?? 'Episode'}`}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950">
            <div className="w-16 h-16 border border-zinc-700 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="w-8 h-8 text-zinc-600"
              >
                <path
                  strokeLinecap="square"
                  d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                />
              </svg>
            </div>
            <p className="text-xs uppercase tracking-widest text-zinc-600 font-medium">
              Select an episode &amp; server to play
            </p>
          </div>
        )}
      </div>

      {/* Player controls bar */}
      <div className="flex items-center gap-4 px-3 py-2 bg-zinc-900/80 border border-t-0 border-zinc-800">

                  {/* Prev / Next */}
              <button
                onClick={() =>
                  prevEp?.episodeNumber != null &&
                  handleEpisodeSelect?.(prevEp, prevEp.episodeNumber)
                }
                disabled={!prevEp}
                aria-label="Previous episode"
                className="flex items-center gap-2 px-4 py-2 border border-zinc-800 text-xs uppercase tracking-widest font-bold text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                    clipRule="evenodd"
                  />
                </svg>
                Prev
              </button>


                  <ToggleButton
                    active={localAutoplay}
                    onClick={handleAutoplayToggle}
                    label="Autoplay"
                    aria-label={`Autoplay is ${localAutoplay ? 'on' : 'off'}`}
                  />

              <button
                onClick={() =>
                  nextEp?.episodeNumber != null &&
                  handleEpisodeSelect?.(nextEp, nextEp.episodeNumber)
                }
                disabled={!nextEp}
                aria-label="Next episode"
                className="flex items-center gap-2 px-4 py-2 border border-zinc-800 text-xs uppercase tracking-widest font-bold text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ml-auto"
              >
                Next
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
  'aria-label': ariaLabel,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  'aria-label'?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel ?? label}
      aria-pressed={active}
      className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] uppercase tracking-widest font-bold border transition-colors ${
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'
      }`}
    >
      <span
        className={`inline-block w-1.5 h-1.5 ${active ? 'bg-primary' : 'bg-zinc-600'}`}
      />
      {label}
    </button>
  );
}