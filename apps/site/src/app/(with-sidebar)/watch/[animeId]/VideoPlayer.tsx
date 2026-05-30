'use client';

import { useState, useEffect, useRef } from 'react';
import { LoaderCircle, Settings, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Server } from '@/types/watch';

import CustomImage from "@/components/custom-image"

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

interface Progress {
  currentTime: number;
  duration: number;
  percent: number;
}

// ── localStorage helpers ──────────────────────────────────────────────────────
// Wrapped in try/catch because localStorage can throw in private-mode browsers.

const LS_VIDEO_AUTOPLAY = 'player:video-autoplay';
const LS_NEXT_AUTOPLAY = 'player:autoplay-next';

function readVideoAutoplay(): boolean {
  try { return localStorage.getItem(LS_VIDEO_AUTOPLAY) !== 'false'; } catch { return true; }
}
function writeVideoAutoplay(v: boolean): void {
  try { localStorage.setItem(LS_VIDEO_AUTOPLAY, v ? 'true' : 'false'); } catch {}
}
function readAutoplayNext(): boolean {
  try { return localStorage.getItem(LS_NEXT_AUTOPLAY) !== 'false'; } catch { return true; }
}
function writeAutoplayNext(v: boolean): void {
  try { localStorage.setItem(LS_NEXT_AUTOPLAY, v ? 'true' : 'false'); } catch {}
}
function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getEpisodeNum(ep: any): number | null {
  const num = Number(ep?.episode ?? ep?.episodeNumber);
  return Number.isFinite(num) ? num : null;
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface VideoPlayerProps {
  src: string | null;
  currentServer: Server | null;
  title?: string;
  animeCover?: string;
  currentEpisode?: number | null;
  episodeTitle?: string;
  handleEpisodeSelect?: (ep: any, num: number) => void;
  prevEp?: any;
  nextEp?: any;
  loadingState: LoadingState;
  debugMessages?: boolean;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function VideoPlayer({
  src,
  currentServer,
  title,
  animeCover,
  episodeTitle,
  currentEpisode,
  handleEpisodeSelect,
  prevEp,
  nextEp,
  loadingState,
  debugMessages = false,
}: VideoPlayerProps) {
  // ── Autoplay state ─────────────────────────────────────────────────────────
  //
  // videoAutoplay  → controls ?autoplay= in the iframe URL.
  //                  Saved to localStorage. Toggling it does NOT rebuild the
  //                  active iframe — it takes effect on the next src change.
  //
  // autoplayNext   → controls whether the player advances to the next episode
  //                  when the current one ends (via postMessage).
  //                  Completely independent of the iframe URL.
  //
  // Both default to true on SSR; the real value is hydrated from localStorage
  // in the mount effect below.
  const [videoAutoplay, setVideoAutoplay] = useState(true);
  const [autoplayNext, setAutoplayNext] = useState(true);

  // ── Frozen iframe URL ─────────────────────────────────────────────────────
  // iframeSrc is STATE, not a computed value. It is rebuilt only when `src`
  // changes (new episode or server selection). Toggling either autoplay state
  // never triggers a re-render that touches this value → no accidental reload.
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);

  // ── Hydrate preferences from localStorage on mount ────────────────────────
  useEffect(() => {
    setVideoAutoplay(readVideoAutoplay());
    setAutoplayNext(readAutoplayNext());
  }, []);

  // ── Rebuild iframe URL only when src changes ──────────────────────────────
  useEffect(() => {
    setProgress(null);
    if (!src) {
      setIframeSrc(null);
      return;
    }
    // Read from localStorage directly — avoids stale closure on videoAutoplay state.
    const va = readVideoAutoplay();
    setIframeSrc(`${src}${src.includes('?') ? '&' : '?'}autoplay=${va ? 'true' : 'false'}`);
  }, [src]); // ← only src, never autoplay state

  // ── Ref for postMessage handler (always sees latest without re-registering) ─
  const stateRef = useRef({
    autoplayNext,
    nextEp,
    handleEpisodeSelect,
    currentServer,
    debugMessages,
  });
  useEffect(() => {
    stateRef.current = { autoplayNext, nextEp, handleEpisodeSelect, currentServer, debugMessages };
  });

  // ── postMessage listener ──────────────────────────────────────────────────
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      let data = event.data;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch { return; }
      }

      const { currentServer, autoplayNext, nextEp, handleEpisodeSelect } = stateRef.current;
      if (!currentServer?.normalizer) return;

      const playerEvent = currentServer.normalizer(data);
      if (!playerEvent) return;

      if (playerEvent.type === 'complete') {
        const nextEpNum = getEpisodeNum(nextEp);

        if (autoplayNext && nextEp && nextEpNum != null) {
          handleEpisodeSelect?.(nextEp, nextEpNum);
        }
      }
      if (playerEvent.type === 'progress') {
        const { currentTime, duration } = playerEvent;
        const percent =
          playerEvent.percent != null && playerEvent.percent > 0
            ? playerEvent.percent
            : duration > 0 ? (currentTime / duration) * 100 : 0;
        setProgress({ currentTime, duration, percent });
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []); // registers once; stateRef keeps it fresh

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleVideoAutoplayToggle = () => {
    const next = !videoAutoplay;
    setVideoAutoplay(next);
    writeVideoAutoplay(next);
    // Intentionally does NOT update iframeSrc — takes effect on the next episode load.
  };

  const handleAutoplayNextToggle = () => {
    const next = !autoplayNext;
    setAutoplayNext(next);
    writeAutoplayNext(next);
  };


  const prevEpNum = getEpisodeNum(prevEp);
  const nextEpNum = getEpisodeNum(nextEp);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="w-full flex flex-col gap-0">
        {/* ── Player ── */}
        <div
          className="relative w-full bg-black border bg-linear-to-b from-transparent via-primary/50 to-transparent"
          style={{ aspectRatio: '16/9' }}
          aria-label={`Video player${title ? ` — ${title}` : ''}`}
        >
          {loadingState === 'loading' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950">
              <LoaderCircle size={24} className="animate-spin" />
              <p className="text-xs uppercase tracking-widest text-foreground font-medium">
                Getting episodes &amp; servers...
              </p>
            </div>
          ) : iframeSrc ? (
            <iframe
              src={iframeSrc}
              className="absolute inset-0 w-full h-full bg-black"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={episodeTitle ?? title ?? 'Anime Episode'}
              aria-label={`Playing: ${episodeTitle ?? 'Episode'}`}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950">
              <div className="w-16 h-16 border border-zinc-700 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-zinc-600">
                  <path strokeLinecap="square" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                </svg>
              </div>
              <p className="text-xs uppercase tracking-widest text-zinc-600 font-medium">
                Select an episode &amp; server to play
              </p>
            </div>
          )}
        </div>

        {/* ── Controls bar ── */}
        <div className="flex items-center gap-3 px-3 py-2 bg-primary/2 border border-t-0">
          <button
           onClick={() =>
              prevEp && prevEpNum != null &&
              handleEpisodeSelect?.(prevEp, prevEpNum)
            }
            disabled={prevEpNum == null}
            aria-label="Previous episode"
            className="flex items-center gap-2 px-4 py-2 border text-xs uppercase tracking-widest font-bold text-foreground/60 hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} />
            Prev
          </button>

          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="Player settings"
            className="flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-widest font-bold border text-foreground/60 hover:border-primary hover:text-primary transition-colors"
          >
            <Settings size={14} />
            Settings
          </button>

          <button
            onClick={() =>
              nextEp && nextEpNum != null &&
              handleEpisodeSelect?.(nextEp, nextEpNum)
            }
            disabled={nextEpNum == null}
            aria-label="Next episode"
            className="flex items-center gap-2 px-4 py-2 border text-xs uppercase tracking-widest font-bold text-foreground/60 hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed ml-auto"
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* ── Settings dialog ── */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="p-0 gap-0 max-w-xl w-full border bg-background shadow-2xl overflow-hidden rounded-none [&>button]:hidden">
          

          {/* Now Playing card */}
          <div className="relative overflow-hidden">


            <DialogClose className="absolute top-2 right-2 z-10 text-muted-foreground/50 rounded-none hover:text-primary hover:border-primary transition-colors shrink-0 bg-transparent h-7 w-7 flex items-center justify-center border">
              <X size={16} />
            </DialogClose>
          <DialogTitle className="sr-only">Player Settings</DialogTitle>



            {/* Blurred cover background */}
            {animeCover ? (
              <div
                className="absolute inset-0 scale-110"
                style={{
                  backgroundImage: `url(${animeCover})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'blur(24px) brightness(0.25) saturate(1.4)',
                }}
              />
            ) : (
              <div className="absolute inset-0 bg-zinc-800" />
            )}
            {/* Gradient so bottom of card bleeds cleanly into settings section */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-900/70" />

            <div className="relative flex gap-3.5 p-4">
              {/* Cover image */}
              {animeCover ? (
                <CustomImage
                  width={72}
                  height={96}
                  src={animeCover}
                  alt={title ?? 'Anime cover'}
                  className="w-18 h-24 object-cover shrink-0 border-white/10 shadow-lg border-2"
                />
              ) : (
                <div className="w-18 h-24 bg-muted shrink-0 flex items-center justify-center border">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-foreground/80">
                    <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                  </svg>
                </div>
              )}

              {/* Info + progress */}
              <div className="flex flex-col justify-between min-w-0 flex-1 py-0.5">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-primary font-bold mb-1">
                    Now Watching
                  </p>
                  <p className="text-[16px] font-bold text-foreground leading-snug line-clamp-2">
                    {title ?? 'Unknown Anime'}
                  </p>
                  <p className="text-[12px] text-foreground/50 mt-0.5 truncate">
                    {currentEpisode != null && (
                      <span className="text-zinc-500">Ep {currentEpisode}</span>
                    )}
                    {episodeTitle && currentEpisode != null && (
                      <span className="text-zinc-600"> · </span>
                    )}
                    {episodeTitle}
                  </p>
                </div>

                {progress && (
                  <div className="mt-3">
                  {progress ? (
                    <>
                      <div className="w-full h-0.75 bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-700 ease-out"
                          style={{ width: `${Math.min(Math.max(progress.percent, 0), 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1.5">
                        <span className="text-[10px] tabular-nums text-foreground/80">
                          {formatTime(progress.currentTime)}
                        </span>
                        <span className="text-[10px] tabular-nums text-foreground/80">
                          {progress.duration > 0 ? formatTime(progress.duration) : '--:--'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-full h-0.75 bg-zinc-700/60 rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-zinc-600/40 rounded-full animate-pulse" />
                      </div>
                      <p className="text-[9px] text-zinc-600 mt-1.5 uppercase tracking-widest">
                        {src ? 'Waiting for playback…' : 'No server selected'}
                      </p>
                    </>
                  )}
                </div>
                )}
                


              </div>
            </div>
          </div>

          {/* Settings section */}
          <div className="px-4 pt-3 pb-4 border-t space-y-0.5">
            <p className="text-[9px] uppercase tracking-[0.15em] text-primary font-bold mb-2">
              Player Settings
            </p>

            <SettingRow
              label="Autoplay next episode"
              description="Advance to the next episode automatically when this one ends"
              hint="Might not work for some servers (can't retrieve data)"
              active={autoplayNext}
              onToggle={handleAutoplayNextToggle}
            />

            <SettingRow
              label="Video autoplay"
              description="Start playing video automatically when you load or switch episodes"
              hint="Might not work for some servers"
              active={videoAutoplay}
              onToggle={handleVideoAutoplayToggle}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── SettingRow ────────────────────────────────────────────────────────────────

function SettingRow({
  label,
  description,
  hint,
  active,
  onToggle,
}: {
  label: string;
  description?: string;
  hint?: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b last:border-0">
      <div className="flex flex-col min-w-0">
        <span className="text-[14px] font-bold text-foreground/80 uppercase tracking-wide leading-tight">
          {label}
        </span>
        {description && (
          <span className="text-[11px] text-foreground/20 mt-0.5 leading-snug">{description}</span>
        )}
        {hint && (
          <span className="text-[10px] text-foreground/15 mt-0.5 italic leading-snug">- {hint}</span>
        )}
      </div>

      {/* Pill toggle */}
      <button
        onClick={onToggle}
        role="switch"
        aria-checked={active}
        aria-label={label}
        className={`relative cursor-pointer shrink-0 w-9 h-5 rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-primary ${
          active ? 'bg-primary' : 'bg-muted'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-foreground/80 shadow-sm transition-transform duration-200 ${
            active ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}