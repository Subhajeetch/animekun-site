import type { AnimeResult } from "./types.js";

export type HomepageAnime = Omit<AnimeResult, "description" | "tags">;

export interface SpotlightAnime extends HomepageAnime {
  description: string | null;
}

export interface LatestEpisodeAnime extends HomepageAnime {
  latestEpisode: {
    episode: number | null;
    airingAt: number | null;
    airingAtDate: string | null;
  };
}

export interface HomepageSection<T = HomepageAnime> {
  title: string;
  results: T[];
}

export interface TrendingByTime {
  byDay: HomepageAnime[];
  byWeek: HomepageAnime[];
  byMonth: HomepageAnime[];
}

export interface HomepageData {
  spotlight: SpotlightAnime[];
  trending: HomepageAnime[];
  topByTime: TrendingByTime;
  mostWatched: HomepageSection;
  mostPopular: HomepageSection;
  latestEpisodes: HomepageSection<LatestEpisodeAnime>;
  topRated: HomepageSection;
  thisSeasonPopular: HomepageSection;
  generatedAt: string;
  cacheExpiresAt: number;
}

export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}