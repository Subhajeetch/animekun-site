'use client';

import { useState, useMemo } from 'react';
import { TvMinimal } from 'lucide-react';
import { EpisodeData, nextAiringEpisode } from '@/types/watch';
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
  nextAirEpisode?: nextAiringEpisode | null;
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
        if (ep.type !== 'Regular Episode' || isNaN(Number(ep.episode))) return false;
        if (nextAirEpisode?.episode != null && Number(ep.episode) >= nextAirEpisode.episode) return false;
        return true;
      })
      .sort((a, b) => Number(a.episode) - Number(b.episode)),
  [episodes, nextAirEpisode]
);  

  const totalEps = regularEpisodes.length;
  const pageCount = Math.ceil(totalEps / PAGE_SIZE);
  const [page, setPage] = useState(0);

  const useCompact = totalEps > 30;

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
        <p className="text-xs uppercase tracking-widest text-zinc-600">
          No episodes found
        </p>
      </div>
    );
  }

  return (
    
    <div>
      <div className="flex items-center gap-3 px-3 py-1 pb-2 border-b mb-2 border-zinc-800 justify-between ">
        <span className="flex items-center gap-3 text-[13px] uppercase tracking-[0.22em] font-bold text-zinc-500">
          <TvMinimal className="w-4 h-4 text-zinc-500" />
          Episodes
        </span>

        {totalEps > 100 && (
          <div className="">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div
                  className="flex items-center gap-2 px-3 py-1 border border-zinc-700 bg-zinc-900 text-xs tracking-widest text-zinc-300 font-bold hover:border-zinc-500 transition-colors w-full"
                  aria-label="Select episode page"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3 h-3 text-zinc-500"
                  >
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
      <div 
      className="pr-1.5 max-h-100 lg:max-h-full overflow-y-auto"
      >
      {!useCompact ? (
        <div className="flex flex-col gap-0" role="listbox" aria-label="Episode list">
          {pageEpisodes.map((ep) => {
            const num = Number(ep.episode);
            const isActive = currentEpisode === num;
            const isWatched = watchedEpisodes.includes(num);
            const epTitle = ep.title?.en ?? ep.nameTvdb ?? `Episode ${num}`;

            return (
              <button
                key={ep.episode}
                role="option"
                aria-selected={isActive}
                aria-label={`Episode ${num}: ${epTitle}${isWatched ? ' (watched)' : ''}`}
                onClick={() => onEpisodeSelect(ep, num)}
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
                {isActive && (
                  <span className="ml-auto shrink-0 w-1.5 h-1.5 bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-5 gap-1" role="listbox" aria-label="Episode list">
          {pageEpisodes.map((ep) => {
            const num = Number(ep.episode);
            const isActive = currentEpisode === num;
            const isWatched = watchedEpisodes.includes(num);
            const epTitle = ep.title?.en ?? ep.nameTvdb ?? `Episode ${num}`;

            return (
              <button
                key={ep.episode}
                role="option"
                aria-selected={isActive}
                aria-label={`Episode ${num}${epTitle ? `: ${epTitle}` : ''}${isWatched ? ' (watched)' : ''}`}
                title={epTitle}
                onClick={() => onEpisodeSelect(ep, num)}
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