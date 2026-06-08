"use client";

import Link from "next/link";
import { Play, Star } from "lucide-react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import CustomImage from "@/components/custom-image";
import type { SpotlightAnime } from "../lib/home-types";
import {
  formatAnimeMeta,
  formatEpisodeCount,
  formatScore,
  getAnimeHref,
  getAnimeImage,
  getAnimeTitle,
  getHeroDescription,
  getWatchHref,
} from "../lib/home-utils";

interface HeroSliderProps {
  items: SpotlightAnime[];
}

export default function HeroSlider({ items }: HeroSliderProps) {
  if (items.length === 0) return null;

  return (
    <section className="relative bg-background" aria-label="Spotlight anime">
      <Splide
        tag="div"
        aria-label="Spotlight anime slides"
        className="animekun-splide animekun-hero-splide"
        options={{
          type: items.length > 1 ? "loop" : "slide",
          arrows: items.length > 1,
          pagination: items.length > 1,
          autoplay: items.length > 1,
          interval: 5000,
          speed: 850,
          pauseOnHover: true,
          pauseOnFocus: true,
          keyboard: "global",
          easing: "cubic-bezier(.22,1,.36,1)",
        }}
      >
        {items.map((anime, index) => {
          const title = getAnimeTitle(anime);
          const image = getAnimeImage(anime);
          const HeadingTag: "h1" | "h2" = index === 0 ? "h1" : "h2";

          return (
            <SplideSlide key={anime.id}>
              <article className="relative h-[320px] overflow-hidden bg-background md:h-[560px] lg:h-[590px]">
                {image && (
                  <div className="absolute inset-0">
                    <CustomImage
                      src={image}
                      width={1440}
                      height={720}
                      alt=""
                      className="h-full w-full object-cover md:object-[70%_center]"
                      aria-hidden="true"
                    />
                  </div>
                )}

                {/* App-background fades over the image */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-1"
                  style={{
                    background: `
                      linear-gradient(
                        90deg,
                        var(--background) 0%,
                        color-mix(in srgb, var(--background) 97%, transparent) 16%,
                        color-mix(in srgb, var(--background) 76%, transparent) 35%,
                        color-mix(in srgb, var(--background) 36%, transparent) 58%,
                        transparent 78%
                      ),
                      linear-gradient(
                        0deg,
                        var(--background) 0%,
                        color-mix(in srgb, var(--background) 82%, transparent) 12%,
                        color-mix(in srgb, var(--background) 42%, transparent) 28%,
                        transparent 52%
                      ),
                      linear-gradient(
                        270deg,
                        color-mix(in srgb, var(--background) 78%, transparent) 0%,
                        color-mix(in srgb, var(--background) 46%, transparent) 12%,
                        color-mix(in srgb, var(--background) 18%, transparent) 28%,
                        transparent 48%
                      )
                    `,
                  }}
                />

                <div className="relative z-10 flex h-full items-center px-2 pt-10">
                  <div className="mt-16 max-w-[640px] md:mt-20">
                    <p className="mb-3 text-xs font-black uppercase text-primary">
                      Spotlight #{index + 1}
                    </p>

                    <HeadingTag className="line-clamp-2 max-w-[620px] text-2xl font-black leading-[0.98] text-white drop-shadow md:text-5xl lg:text-6xl">
                      {title}
                    </HeadingTag>

                    <p className="mt-4 text-sm font-bold text-zinc-200">
                      {formatAnimeMeta(anime)}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="bg-orange-600 px-2.5 py-1 text-xs font-black text-white">
                        {formatEpisodeCount(anime.episodes)}
                      </span>
                      <span className="bg-emerald-500 px-2.5 py-1 text-xs font-black text-black">
                        {formatScore(anime.averageScore)}
                      </span>
                      <span className="bg-cyan-400 px-2.5 py-1 text-xs font-black text-black">
                        HD
                      </span>
                    </div>

                    <p className="mt-5 line-clamp-3 max-w-[600px] text-sm leading-7 text-foreground/50 hidden md:block">
                      {getHeroDescription(anime)}
                    </p>

                    <div className="mt-7 flex flex-wrap gap-3">
                      <Link
                        href={getWatchHref(anime)}
                        aria-label={`Watch ${title}`}
                        className="inline-flex items-center gap-2 bg-primary px-4 py-2 md:px-6 md:py-3 text-sm font-black uppercase transition-colors hover:bg-primary/80 hover:text-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                      >
                        <Play className="h-5 w-5 fill-current" aria-hidden="true" />
                        Watch Now
                      </Link>

                      <Link
                        href={getAnimeHref(anime)}
                        aria-label={`View details for ${title}`}
                        className="items-center hidden md:flex gap-2 border bg-background/70 px-6 py-3 text-sm font-black uppercase transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hover:text-primary"
                      >
                        <Star className="h-4 w-4" aria-hidden="true" />
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            </SplideSlide>
          );
        })}
      </Splide>
    </section>
  );
}