import axios from "axios";
import { 
    anilist,
    AnimeDetails,
    AniListError
 } from "@repo/anilist";
import { notFound } from "next/navigation";
import WatchClient from "./WatchClient";

const { extractIdFromSlug } = anilist;

async function getAnime(id: number): Promise<AnimeDetails> {
  try {
    const { data } = await axios.get<AnimeDetails>(
      `${process.env.API_URL ?? "http://localhost:3001"}/api/anilist/anime/${id}`
    );
    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status ?? 500;
      const message = err.response?.data?.message ?? err.message ?? "Failed to fetch anime";
      throw new AniListError(message, { status });
    }
    throw new AniListError("Unexpected error fetching anime", { status: 500 });
  }
}

export default async function WatchPage({
  params,
}: {
  params: Promise<{ animeId: string }>;
}) {
  const { animeId } = await params;
  const id = extractIdFromSlug(animeId);

  if (!id) notFound();

  let anime: AnimeDetails;

  try {
    anime = await getAnime(id);
  } catch (err) {
    if (err instanceof AniListError && err.status === 404) notFound();
    throw err;
  }

  const displayTitle =
    anime.title.english ?? anime.title.romaji ?? anime.title.native ?? "Unknown Anime";

  return (
    <WatchClient
      anilistId={String(id)}
      animeTitle={displayTitle}
      animeCover={
        anime.coverImage.extraLarge ??
        anime.coverImage.large ??
        anime.coverImage.medium ??
        undefined
      }
      animeBanner={anime.bannerImage ?? undefined}
      animeSlug={animeId}
      malId={anime.idMal ?? undefined}
      nextAirEpisode={anime.nextAiringEpisode?.episode ?? undefined}
    />
  );
}