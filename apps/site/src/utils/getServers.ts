import { Server } from '@/types/watch';

interface GetServersParams {
  anilistId?: number | string;
  malId?: number | string;
  tmdbId?: number | string;
  tmdbSeason?: number | string;
  tmdbEpisode?: number | string;
  episodeNumber: number | string;
  language: 'sub' | 'dub';
}

interface KwikStreamEntry {
  sub?: { url?: string };
  dub?: { url?: string };
}

interface KwikResponse {
  'Kiwi-Stream-360p'?: KwikStreamEntry;
  'Kiwi-Stream-720p'?: KwikStreamEntry;
  'Kiwi-Stream-1080p'?: KwikStreamEntry;
  status?: unknown;
}

// Fetch Kwik URL from mewcdn mapper API
export async function fetchKwikUrl(
  malId: number | string,
  episodeNumber: number | string,
  language: 'sub' | 'dub'
): Promise<string | null> {
  try {
    // Cache bust to next hour boundary
    const now = Date.now();
    const nextHour = Math.ceil(now / 3600000) * 3600000;
    const unixTs = Math.floor(nextHour / 1000);

    const res = await fetch(
      `https://mapper.mewcdn.online/api/mal/${malId}/${episodeNumber}/${unixTs}`,
      { next: { revalidate: 3600 } }
    );

    console.log(res);

    if (!res.ok) return null;

    const data: KwikResponse = await res.json();

    // Prefer 1080p > 720p > 360p
    const qualities = [
      'Kiwi-Stream-1080p',
      'Kiwi-Stream-720p',
      'Kiwi-Stream-360p',
    ] as const;

    for (const q of qualities) {
      const entry = data[q];
      if (!entry) continue;
      const url = language === 'dub' ? entry.dub?.url : entry.sub?.url;
      if (url) return `https://kwik.cx/e/${url}`;
    }

    return null;
  } catch {
    return null;
  }
}

function buildAnilistServers(
  params: GetServersParams
): Server[] {
  const { anilistId, episodeNumber, language } = params;
  if (!anilistId) return [];

  return [
    {
      id: 'animeplay.cfd',
      name: 'Animekun 1',
      url: `https://animeplay.cfd/stream/ani/${anilistId}/${episodeNumber}/${language}`,
      isStatic: true,
      category: 'anilist',
    },
    {
      id: 'vidnest.fun',
      name: 'Animekun 2',
      url: `https://vidnest.fun/animepahe/${anilistId}/${episodeNumber}/${language}`,
      isStatic: true,
      category: 'anilist',
    },
    {
      id: 'tryembed.us.cc',
      name: 'Animekun 3',
      url: `https://tryembed.us.cc/embed/anime/${anilistId}/${episodeNumber}/${language}`,
      isStatic: true,
      category: 'anilist',
    },
    {
      id: 'vidnest.fun.anime',
      name: 'Animekun 4',
      url: `https://vidnest.fun/anime/${anilistId}/${episodeNumber}/${language}`,
      isStatic: true,
      category: 'anilist',
    },
    {
      id: 'megaplay.buzz.ani',
      name: 'Animekun 5',
      url: `https://megaplay.buzz/stream/ani/${anilistId}/${episodeNumber}/${language}`,
      isStatic: true,
      category: 'anilist',
    },
    // {
    //   id: 'dropfile.cc',
    //   name: 'Animekun 6',
    //   url: `https://dropfile.cc/player/tv/anilist-${anilistId}/1/${episodeNumber}?audio=${language}&lang=en`,
    //   isStatic: true,
    //   category: 'anilist',
    // },
  ];
}

function buildMalServers(params: GetServersParams): Server[] {
  const { malId, episodeNumber, language } = params;
  if (!malId) return [];

  return [
    {
      id: 'anipub.xyz',
      name: 'Animekun 1',
      url: `https://anipub.xyz/play/${malId}/${episodeNumber}/${language}`,
      isStatic: true,
      category: 'mal',
    },
    {
      id: 'animeplay.cfd-mal',
      name: 'Animekun 2',
      url: `https://animeplay.cfd/stream/mal/${malId}/${episodeNumber}/${language}`,
      isStatic: true,
      category: 'mal',
    },

    {
      id: 'megaplay.buzz.mal',
      name: 'Animekun 3',
      url: `https://megaplay.buzz/stream/mal/${malId}/${episodeNumber}/${language}`,
      isStatic: true,
      category: 'mal',
    },
    // {
    //   id: 'kwik.cx',
    //   name: 'Animekun 3',
    //   // Placeholder — URL resolved dynamically via fetchKwikUrl
    //   url: `https://kwik.cx/e/__KWIK_PLACEHOLDER__`,
    //   isStatic: false,
    //   category: 'mal',
    // },
  ];
}

function buildTmdbServers(params: GetServersParams): Server[] {
  const { tmdbId, tmdbSeason, tmdbEpisode } = params;
  if (!tmdbId) return [];

  const season = tmdbSeason ?? 1;
  const episode = tmdbEpisode ?? params.episodeNumber;

  return [
    {
      id: 'vidfast.pro',
      name: 'Animekun 1',
      url: `https://vidfast.pro/tv/${tmdbId}/${season}/${episode}`,
      isStatic: true,
      category: 'tmdb',
    },
    {
      id: 'player.videasy.net',
      name: 'Animekun 2',
      url: `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}`,
      isStatic: true,
      category: 'tmdb',
    },
  ];
}

export function getServers(params: GetServersParams): {
  mal: Server[];
  anilist: Server[];
  tmdb: Server[];
} {
  return {
    mal: buildMalServers(params),
    anilist: buildAnilistServers(params),
    tmdb: buildTmdbServers(params),
  };
}

export default getServers;