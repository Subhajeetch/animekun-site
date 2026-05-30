'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import VideoPlayer from './VideoPlayer';
import ServerSelector from './ServerSelector';
import EpisodeList from './EpisodeList';
import { EpisodeData, AnimeEpisodesResponse, Server } from '@/types/watch';
import type { AiringEpisode } from "@repo/anilist";
import { getServers } from '@/utils/getServers';
import {
  getWatchedEpisodes,
  markEpisodeWatched,
  getCurrentEpisode,
  setCurrentEpisode,
  getLanguage,
  setLanguage,
  getPreferredServer,
} from '@/utils/watchStorage';


import MusicBars from './PlayBars';
import NextAiringBanner from './NextAirBanner';
import { LoaderCircle, House, ChevronRight } from 'lucide-react';

interface WatchClientProps {
  anilistId: string;
  animeTitle: string;
  animeCover?: string;
  animeBanner?: string;
  animeSlug: string;
  malId?: number;
  tmdbId?: number;
  tmdbSeason?: number;
  nextAirEpisode?: AiringEpisode | null;
}

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export default function WatchClient({
  anilistId,
  animeTitle,
  animeCover,
  animeBanner,
  animeSlug,
  malId,
  tmdbId,
  tmdbSeason,
  nextAirEpisode,
}: WatchClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── State ──────────────────────────────────────────────────────────────────
  const [episodesData, setEpisodesData] = useState<AnimeEpisodesResponse | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [currentEpisode, setCurrentEpisodeState] = useState<number | null>(null);
  const [currentEpisodeData, setCurrentEpisodeData] = useState<EpisodeData | null>(null);
  const [language, setLang] = useState<'sub' | 'dub'>('sub');
  const [watchedEpisodes, setWatchedEpisodes] = useState<number[]>([]);

  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [playerUrl, setPlayerUrl] = useState<string | null>(null);


const leftColRef = useRef<HTMLDivElement>(null);
const [leftColHeight, setLeftColHeight] = useState<number | null>(null);

useEffect(() => {
  const lgQuery = window.matchMedia("(min-width: 1024px)");

  const updateHeight = () => {
    if (!lgQuery.matches) {
      setLeftColHeight(null);
      return;
    }

    if (leftColRef.current) {
      setLeftColHeight(leftColRef.current.offsetHeight);
    }
  };

  updateHeight();

  const observer = new ResizeObserver(updateHeight);

  if (leftColRef.current) {
    observer.observe(leftColRef.current);
  }

  lgQuery.addEventListener("change", updateHeight);
  window.addEventListener("resize", updateHeight);

  return () => {
    observer.disconnect();
    lgQuery.removeEventListener("change", updateHeight);
    window.removeEventListener("resize", updateHeight);
  };
}, []);


  // ── Derived data ──────────────────────────────────────────────────────────
  const regularEpisodes = useMemo(() => {
  if (!episodesData?.episodes) return [];
  return Object.values(episodesData.episodes)
    .filter((ep) => {
      if (ep.type !== 'Regular Episode' || isNaN(Number(ep.episode))) return false;
      if (nextAirEpisode?.episode != null && Number(ep.episode) >= nextAirEpisode.episode) return false;
      return true;
    })
    .sort((a, b) => Number(a.episode) - Number(b.episode));
}, [episodesData, nextAirEpisode]);  // ← add nextAirEpisode to deps

  const mappings = episodesData?.mappings;
  const resolvedMalId = malId ?? mappings?.mal_id;
  const resolvedTmdbId = tmdbId ?? (mappings?.themoviedb_id as { tv?: number })?.tv;
  const resolvedTmdbSeason = tmdbSeason ?? mappings?.season?.tmdb ?? 1;

  // ── Build servers when episode or language changes ─────────────────────────
  const servers = useMemo(() => {
    if (currentEpisode == null) {
      return { anilist: [], mal: [], tmdb: [] };
    }
    return getServers({
      anilistId,
      malId: resolvedMalId,
      tmdbId: resolvedTmdbId,
      tmdbSeason: resolvedTmdbSeason,
      tmdbEpisode: currentEpisode,
      episodeNumber: currentEpisode,
      language,
    });
  }, [anilistId, resolvedMalId, resolvedTmdbId, resolvedTmdbSeason, currentEpisode, language]);

  // ── Fetch episodes on mount ───────────────────────────────────────────────
  useEffect(() => {
    setLoadingState('loading');
    fetch(`/api/get-episodes/${anilistId}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<AnimeEpisodesResponse>;
        })
        .then((data) => {
          //console.log('Fetched episodes data:', data);
        setEpisodesData(data);
        setLoadingState('success');
        })
      .catch((err) => {
        setFetchError(err.message ?? 'Failed to load episodes');
        setLoadingState('error');
      });
  }, [anilistId]);

 useEffect(() => {
  if (loadingState !== 'success' || !regularEpisodes.length) return;

  // Language
  const savedLang = getLanguage(anilistId);
  setLang(savedLang);

  // Watched
  const watched = getWatchedEpisodes(anilistId);
  setWatchedEpisodes(watched);

  // Episode priority: URL ?ep= > localStorage > ep 1
  const urlEp = searchParams.get('episode');
  const savedEp = getCurrentEpisode(anilistId);
  const targetNum = urlEp
    ? parseInt(urlEp, 10)
    : savedEp ?? 1;

  // Find the episode data; fall back to ep 1 if the number isn't in the list
  const epData =
      regularEpisodes.find((e) => Number(e.episode) === targetNum) ??
      regularEpisodes[0];

    if (!epData) return;

   const resolvedNum = Number(epData.episode);

  // Sync URL — write ?ep= if it's missing or points to a nonexistent episode
  if (!urlEp || Number(urlEp) !== resolvedNum) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('episode', String(resolvedNum));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  initEpisode(epData, resolvedNum, savedLang);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [loadingState, regularEpisodes.length]);

  const initEpisode = useCallback(
    (ep: EpisodeData, num: number, lang: 'sub' | 'dub') => {
      setCurrentEpisodeState(num);
      setCurrentEpisodeData(ep);

      const builtServers = getServers({
        anilistId,
        malId: resolvedMalId,
        tmdbId: resolvedTmdbId,
        tmdbSeason: resolvedTmdbSeason,
        tmdbEpisode: num,
        episodeNumber: num,
        language: lang,
      });

      const allIds = [
        ...builtServers.anilist,
        ...builtServers.mal,
        ...builtServers.tmdb,
      ].map((s) => s.id);

      const preferred = getPreferredServer(allIds);
      const defaultServer =
        builtServers.mal[0] ??
        builtServers.anilist[0] ??
        builtServers.tmdb[0];

      const server = preferred
        ? [...builtServers.anilist, ...builtServers.mal, ...builtServers.tmdb].find(
            (s) => s.id === preferred
          ) ?? defaultServer
        : defaultServer;

      if (server?.isStatic) {
        setSelectedServerId(server.id);
        setPlayerUrl(server.url);
      } else if (defaultServer?.isStatic) {
        setSelectedServerId(defaultServer.id);
        setPlayerUrl(defaultServer.url);
      }
    },
    [anilistId, resolvedMalId, resolvedTmdbId, resolvedTmdbSeason]
  );

  // ── Episode selection ─────────────────────────────────────────────────────
  const handleEpisodeSelect = useCallback(
    (ep: EpisodeData, num: number) => {
      setCurrentEpisodeState(num);
      setCurrentEpisodeData(ep);
      setPlayerUrl(null);
      setSelectedServerId(null);

      // Update URL
      const params = new URLSearchParams(searchParams.toString());
      params.set('episode', String(num));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });

      // Save to localStorage
      setCurrentEpisode(anilistId, num);
      markEpisodeWatched(anilistId, num);
      setWatchedEpisodes(getWatchedEpisodes(anilistId));

      // Auto-select preferred server
      const builtServers = getServers({
        anilistId,
        malId: resolvedMalId,
        tmdbId: resolvedTmdbId,
        tmdbSeason: resolvedTmdbSeason,
        tmdbEpisode: num,
        episodeNumber: num,
        language,
      });

      const allIds = [
        ...builtServers.anilist,
        ...builtServers.mal,
        ...builtServers.tmdb,
      ].map((s) => s.id);

      const preferred = getPreferredServer(allIds);
      const all = [
        ...builtServers.anilist,
        ...builtServers.mal,
        ...builtServers.tmdb,
      ];
      const server = preferred
        ? all.find((s) => s.id === preferred) ?? builtServers.anilist[0]
        : builtServers.anilist[0];

      if (server?.isStatic) {
        setSelectedServerId(server.id);
        setPlayerUrl(server.url);
      }
    },
    [
      anilistId,
      language,
      pathname,
      resolvedMalId,
      resolvedTmdbId,
      resolvedTmdbSeason,
      router,
      searchParams,
    ]
  );

  // ── Server selection ──────────────────────────────────────────────────────
  const handleServerSelect = useCallback(
    (_server: Server, resolvedUrl: string) => {
      setSelectedServerId(_server.id);
      setPlayerUrl(resolvedUrl);
    },
    []
  );

  // ── Language change ───────────────────────────────────────────────────────
  const handleLanguageChange = useCallback(
    (lang: 'sub' | 'dub') => {
      setLang(lang);
      setLanguage(anilistId, lang);
      // Re-play current episode with new language if a static server was selected
      if (selectedServerId && currentEpisode != null) {
        const builtServers = getServers({
          anilistId,
          malId: resolvedMalId,
          tmdbId: resolvedTmdbId,
          tmdbSeason: resolvedTmdbSeason,
          tmdbEpisode: currentEpisode,
          episodeNumber: currentEpisode,
          language: lang,
        });
        const all = [
          ...builtServers.anilist,
          ...builtServers.mal,
          ...builtServers.tmdb,
        ];
        const server = all.find((s) => s.id === selectedServerId);
        if (server?.isStatic) {
          setPlayerUrl(server.url);
        }
      }
    },
    [
      anilistId,
      currentEpisode,
      resolvedMalId,
      resolvedTmdbId,
      resolvedTmdbSeason,
      selectedServerId,
    ]
  );

  // ── Navigate prev/next episode ────────────────────────────────────────────
  const currentIndex = regularEpisodes.findIndex(
    (e) => Number(e.episode) === currentEpisode
  );

  const prevEp =
    currentIndex > 0 ? regularEpisodes[currentIndex - 1] : null;

  const nextEp =
    currentIndex >= 0 && currentIndex < regularEpisodes.length - 1
      ? regularEpisodes[currentIndex + 1]
      : null;

  const epTitle =
    currentEpisodeData?.title?.en ??
    currentEpisodeData?.nameTvdb ??
    (currentEpisode != null ? `Episode ${currentEpisode}` : null);


    const currentServer = useMemo(() => {
  if (!selectedServerId) return null;
  return (
    [...servers.anilist, ...servers.mal, ...servers.tmdb].find(
      (s) => s.id === selectedServerId
    ) ?? null
  );
}, [selectedServerId, servers]);



  return (
    <div className="lg:px-2">
      {/* Top breadcrumb */}
      <div className=" pt-4 pb-2 px-1 hidden lg:block">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-[12px] uppercase tracking-widest text-foreground/50">
            <li>
              <Link href="/home" className="hover:text-primary transition-colors">
                <House size={16} />
              </Link>
            </li>
            <li aria-hidden><ChevronRight size={16} /></li>
            <li>
              <Link
                href={`/anime/${animeSlug}`}
                className="hover:text-primary transition-colors truncate"
              >
                {animeTitle}
              </Link>
            </li>
            <li aria-hidden><ChevronRight size={16} /></li>
            <li className="text-foreground/80 truncate" aria-current="page">
              {epTitle ?? 'Watch'}
            </li>
          </ol>
        </nav>
      </div>

      {/* Main layout */}
      <div className="mb-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-4 xl:gap-5 lg:items-stretch">
          {/* ── Left: Player + Episode Info ── */}
          <div ref={leftColRef} className="flex flex-col lg:self-start w-full">
            {/* Player */}
            <VideoPlayer
              src={playerUrl}
              currentServer={currentServer}
              animeCover={animeCover}
              title={animeTitle}
              currentEpisode={currentEpisodeData?.absoluteEpisodeNumber  ?? Number(currentEpisode)}
              episodeTitle={epTitle ?? undefined}
              handleEpisodeSelect={handleEpisodeSelect}
              prevEp={prevEp}
              nextEp={nextEp}
              loadingState={loadingState}
            />

            <div className="flex gap-3 px-2 py-4 border-x  border-b">
              <div className="bg-primary/20 p-3 shrink-0">
                <MusicBars className="h-6" barClassName="w-[6px]" />
              </div>

              <div className="flex min-w-0 flex-col flex-1">
                <span className="text-[16px] uppercase tracking-widest text-zinc-500 font-bold mr-auto">
                  Episode {currentEpisode}
                </span>

                <span className="text-[13px] uppercase tracking-widest text-zinc-500 truncate">
                  {epTitle ?? Number(currentEpisode) ?? 'Select an episode'}
                </span>
              </div>
            </div>
          </div>

          {/* ── Right sidebar (desktop) ── */}
          <div
              style={leftColHeight ? { height: `${leftColHeight}px` } : undefined}
              className="flex flex-col gap-4 px-2 lg:px-0 lg:sticky lg:top-0 lg:min-h-0"
            >
            {/* Server selector — natural height */}
            <div className="lg:shrink-0">
              <ServerSelector
                servers={servers}
                selectedServerId={selectedServerId}
                language={language}
                malId={resolvedMalId}
                episodeNumber={currentEpisode ?? 1}
                onServerSelect={handleServerSelect}
                onLanguageChange={handleLanguageChange}
              />
            </div>

            {/* Episode list — fills remaining height, scrolls internally */}
            <div className="lg:flex-1 lg:min-h-0 flex flex-col gap-2 relative">
              <div className="border border-zinc-800 bg-zinc-900/30 lg:flex-1 lg:overflow-y-auto">
                <EpisodeListWrapper
                  loadingState={loadingState}
                  fetchError={fetchError}
                  regularEpisodes={regularEpisodes}
                  currentEpisode={currentEpisode}
                  watchedEpisodes={watchedEpisodes}
                  onEpisodeSelect={handleEpisodeSelect}
                  nextAirEpisode={nextAirEpisode}
                  noBorder
                />
              </div>
              {nextAirEpisode?.episode && nextAirEpisode?.airingAt && (
                <NextAiringBanner nextAirEpisode={nextAirEpisode} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

interface EpisodeListWrapperProps {
  loadingState: LoadingState;
  fetchError: string | null;
  regularEpisodes: EpisodeData[];
  currentEpisode: number | null;
  watchedEpisodes: number[];
  onEpisodeSelect: (ep: EpisodeData, num: number) => void;
  nextAirEpisode?: AiringEpisode | null
  noBorder?: boolean;
}

function EpisodeListWrapper({
  loadingState,
  fetchError,
  regularEpisodes,
  currentEpisode,
  watchedEpisodes,
  onEpisodeSelect,
  noBorder,
  nextAirEpisode,
}: EpisodeListWrapperProps) {
  if (loadingState === 'loading') {
    return (
      <div
        className={`flex gap-2 items-center justify-center py-10 ${
          noBorder ? '' : 'border'
        }`}
      >
        <LoaderCircle size={24} className="animate-spin" />
        <p>Please wait...</p>
      </div>
    );
  }

  if (loadingState === 'error') {
    return (
      <div
        className={`flex flex-col items-center justify-center py-8 gap-2 ${
          noBorder ? '' : 'border border-red-900/40 bg-red-900/10'
        }`}
      >
        <p className="text-xs uppercase tracking-widest text-red-500 font-bold">
          Failed to load episodes
        </p>
        {fetchError && (
          <p className="text-[10px] text-red-400 opacity-70">{fetchError}</p>
        )}
      </div>
    );
  }

  return (
    <div className={noBorder ? 'p-2' : ''}>
      <EpisodeList
        episodes={regularEpisodes}
        currentEpisode={currentEpisode}
        watchedEpisodes={watchedEpisodes}
        onEpisodeSelect={onEpisodeSelect}
        nextAirEpisode={nextAirEpisode}
      />
    </div>
  );
}