import { GenreAnimeResult } from "@/types/genreResult";


export const GENREPAGE_REVALIDATE_SECONDS = 72 * 60 * 60;


interface GenreResponse {
  success: boolean;
  results: GenreAnimeResult[];
  currentPage: number;
  perPage: number;
  hasNextPage: boolean;
  totalPages: number;
  sortBy: string;
}


export async function getGenreData(
  genreId: string,
  page: number,
  sortBy: string,
  perPage: number = 24
): Promise<GenreResponse | null> {
  try {
    const apiUrl = process.env.API_URL || "http://localhost:3001";
    
    // Construct search params safely
    const searchParams = new URLSearchParams({
      page: page.toString(),
      "per-page": perPage.toString(),
      "sort-by": sortBy,
    });

    const res = await fetch(`${apiUrl}/api/anilist/genre/${genreId}?${searchParams}`, {
      method: "GET",
      next: { revalidate: GENREPAGE_REVALIDATE_SECONDS },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data: GenreResponse = await res.json();
    return data.success ? data : null;
  } catch (err) {
    console.error(`[Genre Page SSR Error] Fetch failed for genre: ${genreId}`, err);
    return null;
  }
}