import type { Metadata } from "next";
import AnimeCard from "@/components/AnimeCard";
import SortDropdown from "./SortDropdown";
import GenrePagination from "./GenrePagination";
import axios from "axios";
import GenreErrorOptions from "./errOptions";
import { genreMap } from "@/utils/genreMap";

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

interface GenreResponse {
  success: boolean;
  results: GenreAnimeResult[];
  currentPage: number;
  perPage: number;
  hasNextPage: boolean;
  totalPages: number;
  sortBy: string;
}

function formatGenreName(slug: string): string {
  return slug
    .split("-")
    .map((word) => (word.toLowerCase() === "fi" ? "Fi" : word.charAt(0).toUpperCase() + word.slice(1)))
    .join("-");
}

export const dynamic = 'force-dynamic';

async function getGenreData(
  genreId: string,
  page: number,
  sortBy: string,
  perPage: number = 24
): Promise<GenreResponse | null> {
  try {
    const apiUrl = process.env.API_URL || "http://localhost:3001";
    const { data } = await axios.get<GenreResponse>(
      `${apiUrl}/api/anilist/genre/${genreId}`,
      {
        params: {
          page,
          "per-page": perPage,
          "sort-by": sortBy,
        },
      }
    );
    return data.success ? data : null;
  } catch (err) {
    console.error(`[Genre Page SSR Error] Fetch failed for genre: ${genreId}`, err);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ genre: string }>;
}): Promise<Metadata> {
  const { genre } = await params;
  
  const matchedGenre = genreMap.find((g) => g.id === genre.toLowerCase());
  const genreName = matchedGenre ? matchedGenre.display : formatGenreName(genre);

  const title = `Browse Best ${genreName} Anime — AnimeApp`;
  const description = `Explore the highest rated, trending, and popular ${genreName} anime series. Sort by score, view release tracking history, and find your next favorite show.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "video.tv_show",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}


interface PageProps {
  params: Promise<{ genre: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function GenrePage({ params, searchParams }: PageProps) {
  const { genre } = await params;
  const resolvedSearchParams = await searchParams;

  const currentPage = typeof resolvedSearchParams.page === "string" ? parseInt(resolvedSearchParams.page, 10) : 1;
  const currentSort = typeof resolvedSearchParams["sort-by"] === "string" ? resolvedSearchParams["sort-by"] : "popularity-desc";

  const perPage = 32;

  const data = await getGenreData(genre, isNaN(currentPage) ? 1 : currentPage, currentSort, perPage);
  const currentGenreData = genreMap.find((g) => g.id === genre.toLowerCase());
  const humanGenreName = currentGenreData ? currentGenreData.display : formatGenreName(genre);

  if (!data || data.results.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">No Results Found</h1>
          <p className="text-lg text-zinc-400">
            We couldn't find any anime matching the <span className="font-semibold text-primary">"{humanGenreName}"</span> genre.
          </p>
          <GenreErrorOptions />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground px-4 md:px-8 lg:px-12 py-6">
      
      <section className="flex flex-col border-b border-zinc-800 pb-5">
        <div className="flex justify-between items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-4xl font-black tracking-tight truncate">
              {humanGenreName} Anime
            </h1>
          </div>

          <div className="shrink-0" aria-label="Sorting utilities">
            <SortDropdown currentSort={data.sortBy} />
          </div>
        </div>  
        
        <p className="text-xs md:text-sm text-zinc-400 mt-2" id="genre-description">
          Showing pages of indexed structural titles matching the {humanGenreName} classifications.
        </p>
      </section>

      <section 
        className="mt-8 grid anime-grid gap-4"
        aria-describedby="genre-description"
      >
        {data.results.map((anime, index) => (
          <article
            key={anime.id}
            className="opacity-0 animate-fade-in-up"
            style={{
              animationDelay: `${index * 35}ms`,
              animationFillMode: "forwards",
            }}
          >
            <AnimeCard anime={anime as any} />
          </article>
        ))}
      </section>

      <section className="mt-12 mb-6" aria-label="Navigation controls">
        <GenrePagination
          currentPage={data.currentPage}
          totalPages={data.totalPages}
          currentSort={data.sortBy}
        />
      </section>
    </div>
  );
}