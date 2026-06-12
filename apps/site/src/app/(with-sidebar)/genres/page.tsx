import Link from "next/link";
import Image from "next/image";
import { genreMap } from "@/utils/genreMap";
import { Play, Star } from "lucide-react";
import CustomImage from "@/components/custom-image";
import "./some.css"

export default function GenreGrid() {
  const genreHref = (id: string) => `/genre/${id}`;

  const firstTwoGenres = genreMap.slice(0, 2);
  const remainingGenres = genreMap.slice(2);

  return (
    <div className="w-full p-2">
      <h1 className="sr-only">
        Browse Anime by Genres
      </h1>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-8">
        {firstTwoGenres.map(g => (
          <Link
            key={g.id}
            className="relative overflow-hidden w-full"
            href={`/genre/${g.id}`}
          >
            <CustomImage
              src={g.gif}
              className="w-full h-full object-cover"
              alt={g.display}
            />
            <div
              className="absolute bottom-4 left-4 right-4 flex
            justify-between"
            >
              <h3 className="font-extrabold text-[36px]">{g.display}</h3>
              <button
                className="bg-primary hover:bg-primary/80 flex justify-center
              items-center p-4"
              >
                <Play size={30} />
              </button>
            </div>
          </Link>
        ))}
      </div>

      <div className=" mt-4 flex min-w-0 items-center gap-3">
        <span className="h-8 w-1.5 shrink-0 bg-primary" aria-hidden="true" />
        <h2
          className="flex min-w-0 items-center gap-2 text-base font-black uppercase tracking-normal text-white md:text-lg"
        >
          <Star size={20} />
          <span className="truncate">Popular Genres</span>
        </h2>
      </div>

        <div className="grid genre-grid-sep">
          {remainingGenres.map((genre) => (
            <Link
              key={genre.id}
              href={genreHref(genre.id)}
              aria-label={`Browse ${genre.display} anime`}
              className="group relative flex h-16 items-center overflow-hidden px-4 py-2 font-black transition-transform duration-200 hover:-translate-y-0.5"
              style={{
                backgroundColor: genre.bgColor,
                color: genre.fgColor,
              }}
            >
              {/* Text Label */}
              <span className="relative z-10 text-sm font-bold tracking-wide select-none">
                {genre.display}
              </span>

              {/* Angled Thumbnail Artwork */}
              <Image
                src={genre.url}
                alt={genre.display}
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                width={50}
                height={50}
                className="
                  absolute
                right-[-6px]
                bottom-[-2px]
                  h-[48px]
                  w-[48px]
                  rotate-[15deg]
                  border border-white/10
                  object-cover
                  shadow-[0_4px_12px_rgba(0,0,0,0.5),0_12px_24px_rgba(0,0,0,0.3)]
                  pointer-events-none
                  select-none
                  transition-transform
                  duration-300
                  ease-out
                  group-hover:rotate-[18deg]
                  group-hover:scale-110
                "
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}