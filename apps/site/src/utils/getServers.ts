import { Server, PlayerEvent, ServerNormalizer } from '@/types/watch';

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

// ─────────────────────────────────────────────────────────────────────────────
// Normalizer families
// One function per message schema. Attach to every server that uses that schema.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * MegaCloud schema — used by animeplay.cfd and megaplay.buzz servers.
 *
 * progress : { channel:"megacloud", event:"time",     time, duration, percent }
 * progress : { type:"watching-log", currentTime, duration }
 * complete : { channel:"megacloud", event:"complete" }
 */
const megacloudNormalizer: ServerNormalizer = (data): PlayerEvent | null => {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;

  // complete
  if (d.channel === 'megacloud' && d.event === 'complete') {
    return { type: 'complete' };
  }

  // progress — time event
  if (
    d.channel === 'megacloud' &&
    d.event === 'time' &&
    typeof d.time === 'number'
  ) {
    return {
      type: 'progress',
      currentTime: d.time,
      duration: typeof d.duration === 'number' ? d.duration : 0,
      percent: typeof d.percent === 'number' ? d.percent : 0,
    };
  }

  // progress — watching-log (secondary heartbeat these servers also send)
  if (d.type === 'watching-log' && typeof d.currentTime === 'number') {
    return {
      type: 'progress',
      currentTime: d.currentTime,
      duration: typeof d.duration === 'number' ? d.duration : 0,
      percent: 0,
    };
  }

  return null;
};

/**
 * PLAYER_EVENT schema — used by tryembed.us.cc, vidfast.pro, player.videasy.net.
 *
 * Outer wrapper: { type: "PLAYER_EVENT", data: { event, ...fields } }
 *
 * progress (tryembed)  : data = { event:"timeupdate", currentTime, duration }
 * progress (vidfast)   : data = { event:"play"|"timeupdate", currentTime, duration, ... }
 * progress (videasy)   : data = { event:"timeupdate", timestamp, duration, progress, ... }
 * complete (all three) : data = { event:"ended", ... }   ← not yet confirmed, assumed standard
 */
const playerEventNormalizer: ServerNormalizer = (data): PlayerEvent | null => {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;

  if (d.type !== 'PLAYER_EVENT') return null;

  const inner = d.data;
  if (!inner || typeof inner !== 'object') return null;
  const ev = inner as Record<string, unknown>;
  const event = ev.event;

  // complete
  if (event === 'ended') {
    return { type: 'complete' };
  }

  // progress
  if (event === 'timeupdate' || event === 'play') {
    // tryembed + vidfast use `currentTime`; videasy uses `timestamp`
    const currentTime =
      typeof ev.currentTime === 'number'
        ? ev.currentTime
        : typeof ev.timestamp === 'number'
        ? ev.timestamp
        : null;

    if (currentTime === null) return null;

    // videasy sends `progress` as 0–1 fraction; convert to percent
    const percent =
      typeof ev.progress === 'number'
        ? ev.progress * 100
        : 0;

    return {
      type: 'progress',
      currentTime,
      duration: typeof ev.duration === 'number' ? ev.duration : 0,
      percent,
    };
  }

  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Server builders
// ─────────────────────────────────────────────────────────────────────────────

function buildAnilistServers(params: GetServersParams): Server[] {
  const { anilistId, episodeNumber, language } = params;
  if (!anilistId) return [];

  return [
    {
      id: 'vidnest.fun',
      name: 'Animekun 1',
      url: `https://vidnest.fun/animepahe/${anilistId}/${episodeNumber}/${language}`,
      isStatic: true,
      category: 'anilist',
      normalizer: megacloudNormalizer, // same origin wrapper — update if logs show different schema
    },
    {
      id: 'tryembed.us.cc',
      name: 'Animekun 2',
      url: `https://tryembed.us.cc/embed/anime/${anilistId}/${episodeNumber}/${language}`,
      isStatic: true,
      category: 'anilist',
      normalizer: playerEventNormalizer,
    },
    {
      id: 'vidnest.fun.anime',
      name: 'Animekun 3',
      url: `https://vidnest.fun/anime/${anilistId}/${episodeNumber}/${language}`,
      isStatic: true,
      category: 'anilist',
      normalizer: megacloudNormalizer,
    },
    {
      id: 'megaplay.buzz.ani',
      name: 'Animekun 4',
      url: `https://megaplay.buzz/stream/ani/${anilistId}/${episodeNumber}/${language}`,
      isStatic: true,
      category: 'anilist',
      normalizer: megacloudNormalizer,
    },
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
      normalizer: megacloudNormalizer,
    },
    {
      id: 'megaplay.buzz.mal',
      name: 'Animekun 2',
      url: `https://megaplay.buzz/stream/mal/${malId}/${episodeNumber}/${language}`,
      isStatic: true,
      category: 'mal',
      normalizer: megacloudNormalizer,
    },
  ];
}

function buildTmdbServers(params: GetServersParams): Server[] {
  const { tmdbId, tmdbSeason, tmdbEpisode, episodeNumber } = params;
  if (!tmdbId) return [];

  const season = tmdbSeason ?? 1;
  const episode = tmdbEpisode ?? episodeNumber;

  return [
    {
      id: 'vidfast.pro',
      name: 'Animekun 1',
      url: `https://vidfast.pro/tv/${tmdbId}/${season}/${episode}`,
      isStatic: true,
      category: 'tmdb',
      normalizer: playerEventNormalizer,
    },
    {
      id: 'player.videasy.net',
      name: 'Animekun 2',
      url: `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}`,
      isStatic: true,
      category: 'tmdb',
      normalizer: playerEventNormalizer,
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

// ─────────────────────────────────────────────────────────────────────────────
// Kwik (dynamic server — unchanged)
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchKwikUrl(
  malId: number | string,
  episodeNumber: number | string,
  language: 'sub' | 'dub'
): Promise<string | null> {
  try {
    const now = Date.now();
    const nextHour = Math.ceil(now / 3600000) * 3600000;
    const unixTs = Math.floor(nextHour / 1000);

    const res = await fetch(
      `https://mapper.mewcdn.online/api/mal/${malId}/${episodeNumber}/${unixTs}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) return null;

    const data: KwikResponse = await res.json();

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

export default getServers;