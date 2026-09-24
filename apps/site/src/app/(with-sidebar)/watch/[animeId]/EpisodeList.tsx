'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { TvMinimal } from 'lucide-react';
import { EpisodeData } from '@/types/watch';
import type { AiringEpisode } from "@repo/anilist";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EpisodeListProps {
  episodes: EpisodeData[];
  currentEpisode: number | null;
  watchedEpisodes: number[];
  onEpisodeSelect: (ep: EpisodeData, num: number) => void;
  nextAirEpisode?: AiringEpisode | null;
}

const PAGE_SIZE = 100;

export default function EpisodeList({
  episodes,
  currentEpisode,
  watchedEpisodes,
  onEpisodeSelect,
  nextAirEpisode,
}: EpisodeListProps) {
  const regularEpisodes = useMemo(
    () =>
      episodes
        .filter((ep) => {
          if (ep.type && ep.type !== 'Regular Episode') return false;
          if (isNaN(Number(ep.episode))) return false;
          if (nextAirEpisode?.episode != null && Number(ep.episode) >= nextAirEpisode.episode)
            return false;
          return true;
        })
        .sort((a, b) => Number(a.episode) - Number(b.episode)),
    [episodes, nextAirEpisode]
  );

  const totalEps = regularEpisodes.length;
  const pageCount = Math.ceil(totalEps / PAGE_SIZE);

  const getPageForEpisode = (epNum: number | null) => {
    if (!epNum) return 0;
    const targetIndex = regularEpisodes.findIndex((ep) => Number(ep.episode) === epNum);
    if (targetIndex === -1) return 0;
    return Math.floor(targetIndex / PAGE_SIZE);
  };

  const [page, setPage] = useState(() => getPageForEpisode(currentEpisode));

  useEffect(() => {
    if (currentEpisode !== null) {
      const targetPage = getPageForEpisode(currentEpisode);
      setPage(targetPage);
    }
  }, [currentEpisode, regularEpisodes]);

  const activeEpRef = useRef<HTMLButtonElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const useCompact = totalEps > 30;

  // ── 1. Bulletproof Internal Container Scroll ──
  useEffect(() => {
    // Increased timeout slightly to ensure all Tailwind layouts are fully painted
    const id = setTimeout(() => {
      if (!activeEpRef.current || !scrollContainerRef.current) return;

      const container = scrollContainerRef.current;
      const button = activeEpRef.current;

      // Calculate absolute distance from top of the scroll container
      let offsetTop = 0;
      let el: HTMLElement | null = button;
      
      // Traverse up to the container to get the exact pixel offset
      while (el && el !== container) {
        offsetTop += el.offsetTop;
        el = el.offsetParent as HTMLElement;
      }

      // Calculate the perfect center
      const targetScroll = offsetTop - (container.clientHeight / 2) + (button.clientHeight / 2);

      // Scroll ONLY the internal episode list wrapper
      container.scrollTo({
        top: targetScroll,
        behavior: 'smooth',
      });
    }, 150);

    return () => clearTimeout(id);
  }, [currentEpisode, page]);

  // ── 2. Click Handler to push main window up ──
  const handleEpisodeClick = (ep: EpisodeData, num: number) => {
    // Fire the selection to your parent component
    onEpisodeSelect(ep, num);
    
    // Explicitly scroll the main browser window up to the media player
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const pageEpisodes = useMemo(() => {
    if (totalEps <= 100) return regularEpisodes;
    return regularEpisodes.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  }, [regularEpisodes, page, totalEps]);

  const pageLabels = useMemo(() => {
    return Array.from({ length: pageCount }, (_, i) => {
      const start = i * PAGE_SIZE + 1;
      const end = Math.min((i + 1) * PAGE_SIZE, totalEps);
      return `${start}–${end}`;
    });
  }, [pageCount, totalEps]);

  if (!totalEps) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-xs uppercase tracking-widest text-zinc-600">No episodes found</p>
      </div>
    );
  }

  return (
    // 1. Made the outermost div a flex container
    <div className="flex flex-col lg:h-full lg:min-h-0">
      {/* ── Header ── */}
      {/* 2. Added shrink-0 so the header never gets squished */}
      <div className="shrink-0 flex items-center gap-3 px-3 py-1 pb-2 border-b mb-2 border-zinc-800 justify-between">
        <span className="flex items-center gap-3 text-[13px] uppercase tracking-[0.22em] font-bold text-zinc-500">
          <TvMinimal className="w-4 h-4 text-zinc-500" />
          Episodes
        </span>

        {totalEps > 100 && (
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div
                  className="flex items-center gap-2 px-3 py-1 border border-zinc-700 bg-zinc-900 text-xs tracking-widest text-zinc-300 font-bold hover:border-zinc-500 transition-colors w-full"
                  aria-label="Select episode page"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-zinc-500">
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{pageLabels[page]}</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="bg-zinc-900 border border-zinc-700 p-0 min-w-[180px]"
                align="start"
              >
                {pageLabels.map((label, i) => (
                  <DropdownMenuItem
                    key={i}
                    onClick={() => setPage(i)}
                    className={`text-xs uppercase tracking-widest font-bold px-3 py-2 cursor-pointer transition-colors ${
                      i === page
                        ? 'text-primary bg-primary/10'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    Episodes {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* ── Episode list container ── */}
      {/* 3. Replaced lg:max-h-[calc...] with lg:flex-1 lg:min-h-0 lg:max-h-none */}
      <div 
        ref={scrollContainerRef} 
        className="relative pr-1.5 overflow-y-auto max-h-100 lg:max-h-none lg:flex-1 lg:min-h-0"
      >
        {!useCompact ? (
          /* ── Full list (≤ 30 episodes) ── */
          <div className="flex flex-col gap-0" role="listbox" aria-label="Episode list">
            {pageEpisodes.map((ep) => {
              const num = Number(ep.episode);
              const isActive = currentEpisode === num;
              const isWatched = watchedEpisodes.includes(num);
              const epTitle = ep.title?.en ?? ep.nameTvdb ?? `Episode ${num}`;

              return (
                <button
                  key={ep.episode}
                  ref={isActive ? activeEpRef : null}
                  role="option"
                  aria-selected={isActive}
                  aria-label={`Episode ${num}: ${epTitle}${isWatched ? ' (watched)' : ''}`}
                  onClick={() => handleEpisodeClick(ep, num)}
                  className={`flex items-center gap-3 px-3 py-2.5 border-b border-zinc-800/60 text-left transition-colors ${
                    isActive
                      ? 'bg-primary/10 border-l-2 border-l-primary text-foreground pl-2.5'
                      : isWatched
                      ? 'opacity-50 hover:opacity-80 hover:bg-zinc-800/40'
                      : 'hover:bg-zinc-800/40'
                  }`}
                >
                  <span
                    className={`text-[13px] font-black tabular-nums w-6 shrink-0 ${
                      isActive ? 'text-primary' : 'text-zinc-600'
                    }`}
                  >
                    {num}
                  </span>
                  <span className="text-[13px] text-zinc-300 font-medium truncate leading-snug">
                    {epTitle}
                  </span>
                  {isActive && <span className="ml-auto shrink-0 w-1.5 h-1.5 bg-primary" />}
                </button>
              );
            })}
          </div>
        ) : (
          /* ── Compact grid (> 30 episodes) ── */
          <div
            className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-5 gap-1"
            role="listbox"
            aria-label="Episode list"
          >
            {pageEpisodes.map((ep) => {
              const num = Number(ep.episode);
              const isActive = currentEpisode === num;
              const isWatched = watchedEpisodes.includes(num);
              const epTitle = ep.title?.en ?? ep.nameTvdb ?? `Episode ${num}`;

              return (
                <button
                  key={ep.episode}
                  ref={isActive ? activeEpRef : null}
                  role="option"
                  aria-selected={isActive}
                  aria-label={`Episode ${num}${epTitle ? `: ${epTitle}` : ''}${isWatched ? ' (watched)' : ''}`}
                  title={epTitle}
                  onClick={() => handleEpisodeClick(ep, num)}
                  className={`px-5 py-1.5 text-[13px] font-bold border transition-colors ${
                    isActive
                      ? 'border-primary bg-primary/10 text-primary'
                      : isWatched
                      ? 'border-zinc-800 bg-zinc-900/30 text-zinc-600 opacity-50 hover:opacity-75'
                      : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}