'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import VideoPlayer from './VideoPlayer';
import ServerSelector from './ServerSelector';
import EpisodeList from './EpisodeList';
import { EpisodeData, AnimeEpisodesResponse, Server } from '@/types/watch';
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

interface WatchClientProps {
  anilistId: string;
  animeTitle: string;
  animeCover?: string;
  animeBanner?: string;
  animeSlug: string;
  malId?: number;
  tmdbId?: number;
  tmdbSeason?: number;
  nextAirEpisode?: number
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
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [currentEpisode, setCurrentEpisodeState] = useState<number | null>(null);
  const [currentEpisodeData, setCurrentEpisodeData] = useState<EpisodeData | null>(null);
  const [language, setLang] = useState<'sub' | 'dub'>('sub');
  const [watchedEpisodes, setWatchedEpisodes] = useState<number[]>([]);

  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [playerUrl, setPlayerUrl] = useState<string | null>(null);
  const [autoplay, setAutoplay] = useState(true);

  // ── Derived data ──────────────────────────────────────────────────────────
  const regularEpisodes = useMemo(() => {
  if (!episodesData?.episodes) return [];
  return Object.values(episodesData.episodes)
    .filter((ep) => ep.type === 'Regular Episode' && !isNaN(Number(ep.episode)))
    .sort((a, b) => Number(a.episode) - Number(b.episode));
}, [episodesData]);

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
          console.log('Fetched episodes data:', data);
        setEpisodesData(data);
        setLoadingState('success');
        })
      .catch((err) => {
        setFetchError(err.message ?? 'Failed to load episodes');
        setLoadingState('error');
      });
  }, [anilistId]);

  // ── Init from localStorage + URL after episodes load ──────────────────────
  useEffect(() => {
    if (loadingState !== 'success' || !regularEpisodes.length) return;

    // Language
    const savedLang = getLanguage(anilistId);
    setLang(savedLang);

    // Watched
    const watched = getWatchedEpisodes(anilistId);
    setWatchedEpisodes(watched);

    // Episode priority: URL ?ep= > localStorage > ep 1
    const urlEp = searchParams.get('ep');
    const epNum = urlEp
  ? parseInt(urlEp, 10)
  : getCurrentEpisode(anilistId) ?? 1;

const epData = regularEpisodes.find((e) => Number(e.episode) === epNum);

const first = regularEpisodes[0];
if (first) {
  initEpisode(first, Number(first.episode), savedLang);
}
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
        builtServers.anilist[0] ??
        builtServers.mal[0] ??
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
      params.set('ep', String(num));
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
    (e) => e.episodeNumber === currentEpisode
  );
  const prevEp = currentIndex > 0 ? regularEpisodes[currentIndex - 1] : null;
  const nextEp =
    currentIndex < regularEpisodes.length - 1
      ? regularEpisodes[currentIndex + 1]
      : null;

  const epTitle =
    currentEpisodeData?.title?.en ??
    currentEpisodeData?.nameTvdb ??
    (currentEpisode != null ? `Episode ${currentEpisode}` : null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top breadcrumb */}
      <div className=" pt-4 pb-2 px-1 hidden lg:block">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-[12px] uppercase tracking-widest text-zinc-600">
            <li>
              <Link href="/" className="hover:text-zinc-400 transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link
                href={`/anime/${animeSlug}`}
                className="hover:text-zinc-400 transition-colors truncate"
              >
                {animeTitle}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-zinc-400 truncate" aria-current="page">
              {epTitle ?? 'Watch'}
            </li>
          </ol>
        </nav>
      </div>

      {/* Main layout */}
      <div className=" pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-4 xl:gap-5">
          {/* ── Left: Player + Episode Info ── */}
          <div className="flex flex-col gap-4">
            {/* Player */}
            <VideoPlayer
              src={playerUrl}
              title={animeTitle}
              currentEpisode={currentEpisodeData?.absoluteEpisodeNumber  ?? Number(currentEpisode)}
              episodeTitle={epTitle ?? undefined}
              autoplay={autoplay}
              onAutoplayChange={setAutoplay}
            />

            {/* Prev / Next */}
            <div className="flex gap-2">
              <button
                onClick={() =>
                  prevEp?.episodeNumber != null &&
                  handleEpisodeSelect(prevEp, prevEp.episodeNumber)
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

              <button
                onClick={() =>
                  nextEp?.episodeNumber != null &&
                  handleEpisodeSelect(nextEp, nextEp.episodeNumber)
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

            {/* Anime info strip */}
            <div className="flex items-center gap-3 py-3 border-t border-zinc-800">
              {animeCover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={animeCover}
                  alt={animeTitle}
                  width={44}
                  height={62}
                  className="w-11 aspect-2/3 object-cover border border-zinc-700 shrink-0"
                />
              )}
              <div className="min-w-0">
                <Link
                  href={`/anime/${animeSlug}`}
                  className="text-sm font-black leading-tight hover:text-primary transition-colors line-clamp-1"
                >
                  {animeTitle}
                </Link>
                {currentEpisodeData?.overview && (
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed line-clamp-2">
                    {currentEpisodeData.overview}
                  </p>
                )}
              </div>
            </div>

            {/* Server selector (mobile — below player) */}
            <div className="lg:hidden">
              <SectionHeader>Servers</SectionHeader>
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

            {/* Episodes (mobile — below servers) */}
            <div className="lg:hidden">
              <SectionHeader>
                Episodes{' '}
                {regularEpisodes.length > 0 && (
                  <span className="text-zinc-600 ml-1">
                    ({regularEpisodes.length})
                  </span>
                )}
              </SectionHeader>
              <EpisodeListWrapper
                loadingState={loadingState}
                fetchError={fetchError}
                regularEpisodes={regularEpisodes}
                currentEpisode={currentEpisode}
                watchedEpisodes={watchedEpisodes}
                nextAirEpisode={nextAirEpisode}
                onEpisodeSelect={handleEpisodeSelect}
              />
            </div>
          </div>

          {/* ── Right sidebar (desktop) ── */}
          <aside className="hidden lg:flex flex-col gap-4">
            {/* Server selector */}
            <div>
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

            {/* Episode list */}
            <div>
              <div className="border border-zinc-800 bg-zinc-900/30 ">
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
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <h2 className="text-[10px] uppercase tracking-[0.22em] font-bold text-zinc-500 whitespace-nowrap">
        {children}
      </h2>
      <div className="flex-1 h-px bg-zinc-800" />
    </div>
  );
}

interface EpisodeListWrapperProps {
  loadingState: LoadingState;
  fetchError: string | null;
  regularEpisodes: EpisodeData[];
  currentEpisode: number | null;
  watchedEpisodes: number[];
  onEpisodeSelect: (ep: EpisodeData, num: number) => void;
  nextAirEpisode?: number;
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
}: EpisodeListWrapperProps) {
  if (loadingState === 'loading') {
    return (
      <div
        className={`flex items-center justify-center py-10 ${
          noBorder ? '' : 'border border-zinc-800 bg-zinc-900/30'
        }`}
      >
        <svg
          className="w-5 h-5 animate-spin text-zinc-600"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
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
      />
    </div>
  );
}