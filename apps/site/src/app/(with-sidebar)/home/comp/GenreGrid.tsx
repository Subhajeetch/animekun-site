import Link from "next/link";
import { ChevronRight } from "lucide-react";
import CustomImage from "@/components/custom-image";
import type { HomepageAnime } from "../lib/home-types";
import { genreHref } from "../lib/home-utils";
import { genreMap } from "@/utils/genreMap";
import Image from "next/image";

const POPULAR_GENRE_IDS = [
  "action",
  "adventure",
  "romance",
  "fantasy",
  "comedy",
  "slice-of-life",
  "psychological",
  "ecchi",
  "drama",
  "sci-fi",
  "music"
];

export default function GenreGrid({ animePool }: { animePool: HomepageAnime[] }) {
  // Filter only the genres we want to show as popular
  const popularGenres = genreMap.filter((genre) =>
    POPULAR_GENRE_IDS.includes(genre.id)
  );

  return (
    <section className="pt-6 px-2" aria-labelledby="popular-genres-heading">
      <h2 id="popular-genres-heading" className="sr-only">
        Popular Genres
      </h2>
      <div className="genre-grid grid ">
        {popularGenres.map((genre, index) => (
          <Link
            key={genre.id}
            href={genreHref(genre.id)}
            aria-label={`Browse ${genre.display} anime`}
            className="group relative h-16 overflow-hidden px-3 py-2 font-black transition-transform hover:-translate-y-0.5"
            style={{
              backgroundColor: genre.bgColor,
              color: genre.fgColor,
            }}
          >
            <span className="relative z-10 text-sm font-bold">
              {genre.display}
            </span>

            <Image
              src={genre.url}
              alt={genre.display}
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              width={92}
              height={130}
              className="
                absolute
                right-[-6px]
                bottom-[-2px]
                h-[50px]
                w-[50px]
                rotate-[20deg]
                shadow-[0_4px_12px_rgba(0,0,0,0.35),0_12px_24px_rgba(0,0,0,0.2)]
                object-cover
                transition-transform
                duration-300
                group-hover:rotate-[22deg]
                group-hover:scale-105
                pointer-events-none
                select-none
              "
            />
          </Link>
        ))}

        <Link
          href="/genres"
          className="flex items-center h-16 border-2 px-3 py-2 text-sm font-black uppercase transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary bg-primary/5 relative overflow-hidden group"
          aria-label="Browse all anime genres"
        >
          <span className="flex items-center gap-1">
            Browse All
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </span>


            <Image
              src="/images/genre/horror.webp"
              alt="Horror"
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              width={92}
              height={130}
              className="
                absolute
                right-[40px]
                bottom-[-2px]
                h-[50px]
                w-[50px]
                rotate-[-20deg]
                shadow-[0_4px_12px_rgba(0,0,0,0.35),0_12px_24px_rgba(0,0,0,0.2)]
                object-cover
                transition-transform
                duration-300
                group-hover:rotate-[-30deg]
                group-hover:scale-120
                pointer-events-none
                select-none
              "
            />

            <Image
              src="/images/genre/thriller.webp"
              alt="Thriller"
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              width={92}
              height={130}
              className="
                absolute
                right-[15px]
                bottom-[-2px]
                h-[50px]
                w-[50px]
                rotate-[15deg]
                shadow-[0_4px_12px_rgba(0,0,0,0.35),0_12px_24px_rgba(0,0,0,0.2)]
                object-cover
                transition-transform
                duration-300
                group-hover:rotate-[16deg]
                group-hover:scale-120
                pointer-events-none
                select-none
              "
            />

            <Image
              src="/images/genre/sports.webp"
              alt="Sports"
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              width={92}
              height={130}
              className="
                absolute
                right-[-6px]
                bottom-[-2px]
                h-[50px]
                w-[50px]
                rotate-[35deg]
                shadow-[0_4px_12px_rgba(0,0,0,0.35),0_12px_24px_rgba(0,0,0,0.2)]
                object-cover
                transition-transform
                duration-300
                group-hover:rotate-[40deg]
                group-hover:scale-120
                pointer-events-none
                select-none
              "
            />
                  
        </Link>
      </div>
    </section>
  );
}