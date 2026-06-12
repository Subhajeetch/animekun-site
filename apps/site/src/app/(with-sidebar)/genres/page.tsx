import Link from "next/link";
import Image from "next/image";
import { genreMap } from "@/utils/genreMap";
import "./some.css"

export default function GenreGrid() {
  const genreHref = (id: string) => `/genre/${id}`;

  return (
    <div className="w-full p-2">
      <div className="">
        <div className="grid genre-grid-sep">
          {genreMap.map((genre) => (
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