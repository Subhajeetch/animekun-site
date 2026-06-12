import { AnimeCoverImage, AnimeDate, AnimeStudio, AnimeTitle, AnimeTrailer } from "@repo/anilist";


export interface AnimeType {
  id: number;
  idMal: number | null;
  title: AnimeTitle;
  coverImage: AnimeCoverImage;
  bannerImage: string | null;
  format: string | null;
  status: string | null;
  season: string | null;
  seasonYear: number | null;
  episodes: number | null;
  duration: number | null;
  genres: string[];
  averageScore: number | null;
  popularity: number | null;
  favourites: number | null;
  isAdult: boolean;
  startDate: AnimeDate;
  endDate: AnimeDate;
  trailer: AnimeTrailer | null;
  studios: AnimeStudio[];
  siteUrl: string | null;
}


export interface SpotlightAnime extends AnimeType {
  description: string | null;
}