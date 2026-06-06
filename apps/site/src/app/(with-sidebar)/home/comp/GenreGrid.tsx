import Link from "next/link";
import { ChevronRight } from "lucide-react";
import CustomImage from "@/components/custom-image";
import type { HomepageAnime } from "../lib/home-types";
import { genreHref, getAnimePoster } from "../lib/home-utils";

const POPULAR_GENRES = [
  { name: "Action", color: "bg-rose-700" },
  { name: "Adventure", color: "bg-green-700" },
  { name: "Romance", color: "bg-fuchsia-700" },
  { name: "Fantasy", color: "bg-blue-600" },
  { name: "Comedy", color: "bg-yellow-600" },
  { name: "Cars", color: "bg-pink-400" },
  { name: "Military", color: "bg-lime-800" },
  { name: "Demons", color: "bg-slate-500" },
  { name: "Slice of Life", color: "bg-emerald-200" },
  { name: "Psychological", color: "bg-sky-700" },
  { name: "Ecchi", color: "bg-purple-300" },
];

interface GenreGridProps {
  animePool: HomepageAnime[];
}

function findGenreImage(genre: string, animePool: HomepageAnime[]): string {
  const match = animePool.find((anime) =>
    anime.genres.some((animeGenre) => animeGenre.toLowerCase() === genre.toLowerCase())
  );

  return match ? getAnimePoster(match) : "";
}

export default function GenreGrid({ animePool }: GenreGridProps) {
  return (
    <section className="pt-6 px-2" aria-labelledby="popular-genres-heading">
      <h2 id="popular-genres-heading" className="sr-only">
        Popular Genres
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {POPULAR_GENRES.map((genre) => {
          const image = findGenreImage(genre.name, animePool);

          return (
            <Link
              key={genre.name}
              href={genreHref(genre.name)}
              aria-label={`Browse ${genre.name} anime`}
              className={`group relative h-16 overflow-hidden px-3 py-2 font-black text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${genre.color}`}
            >
              <span className="relative z-10 text-sm drop-shadow">{genre.name}</span>
              {image && (
                <CustomImage
                  src={image}
                  width={92}
                  height={130}
                  alt=""
                  aria-hidden="true"
                  className="absolute -bottom-8 right-2 h-24 w-16 rotate-12 object-cover shadow-2xl transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110"
                />
              )}
            </Link>
          );
        })}

        <Link
          href="/genres"
          className="flex h-16 items-center justify-center gap-2 border-2 border-zinc-500 bg-zinc-950 px-3 py-2 text-sm font-black uppercase text-white transition-colors hover:border-red-600 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          aria-label="Browse all anime genres"
        >
          Browse All
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}