export interface GenreAnimeResult {
  id: number;
  idMal: number | null;
  title: {
    romaji: string | null;
    english: string | null;
    native: string | null;
    userPreferred: string | null;
  };
  description: string | null;
  coverImage: {
    extraLarge: string | null;
    large: string | null;
    medium: string | null;
    color: string | null;
  };
  genres: string[];
  averageScore: number | null;
  popularity: number | null;
  episodes: number | null;
  format: string | null;
}