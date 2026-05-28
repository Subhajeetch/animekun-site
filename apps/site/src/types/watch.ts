export interface EpisodeData {
  episode: string;
  anidbEid?: string;
  type: string;
  length?: string;
  airdate?: string;
  title?: { en?: string; [key: string]: string | undefined };
  nameTvdb?: string;
  tvdbShowId?: number;
  tvdbId?: number;
  seasonNumber?: number;
  episodeNumber?: number;
  absoluteEpisodeNumber?: number;
  runtime?: number;
  overview?: string;
  image?: string;
  airDate?: string;
}

export interface MappingData {
  type?: string;
  anidb_id?: number;
  anilist_id?: number;
  mal_id?: number;
  themoviedb_id?: { tv?: number; movie?: number };
  tvdb_id?: number;
  season?: { tvdb?: number; tmdb?: number };
  [key: string]: unknown;
}

export interface AnimeEpisodesResponse {
  mainTitle?: string;
  title?: { main?: string; en?: string; [key: string]: string | undefined };
  date?: { startDate?: string; endDate?: string };
  episodes: { [key: string]: EpisodeData };
  mappings?: MappingData;
}

export type Language = 'sub' | 'dub';

export interface Server {
  id: string;
  name: string;
  url: string;
  isStatic: boolean;
  category: 'anilist' | 'mal' | 'tmdb';
}

export interface ResolvedServer extends Server {
  resolvedUrl?: string;
}

export interface WatchedEpisodes {
  [animeId: string]: number[];
}

export interface CurrentEpisodeMap {
  [animeId: string]: number;
}

export interface PlayerSettings {
  autoplay: boolean;
  pip: boolean;
  fullscreen: boolean;
}



export type PlayerEvent =
  | { type: 'complete' }
  | { type: 'progress'; currentTime: number; duration: number; percent: number };

export type ServerNormalizer = (data: unknown) => PlayerEvent | null;

// Add `normalizer` to your existing Server interface:
export interface Server {
  id: string;
  name: string;
  url: string;
  isStatic: boolean;
  category: 'anilist' | 'mal' | 'tmdb';
  normalizer?: ServerNormalizer; // ← new
}
