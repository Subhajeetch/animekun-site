"use client";

import { Splide, SplideSlide } from "@splidejs/react-splide";
import type { ReactNode } from "react";
import type { HomepageAnime, LatestEpisodeAnime } from "../lib/home-types";
import AnimeCard from "./AnimeCard";
import SectionTitle from "./SectionTitle";

interface AnimeRailProps {
  id: string;
  title: string;
  icon?: ReactNode;
  items: Array<HomepageAnime | LatestEpisodeAnime>;
  variant?: "wide" | "poster" | "compact";
}

export default function AnimeRail({ id, title, icon, items, variant = "wide" }: AnimeRailProps) {
  if (items.length === 0) return null;

  return (
    <section className="px-2 mt-6" aria-labelledby={id}>
      <SectionTitle id={id} icon={icon}>
        {title}
      </SectionTitle>
      <Splide
        tag="div"
        aria-labelledby={id}
        className="animekun-splide animekun-rail-splide [&_.splide__arrow]:!rounded-none [&_.splide__arrow]:!bg-zinc-800 [&_.splide__arrow_svg]:!fill-white"
        options={{
          type: "slide",
          arrows: items.length > 2,
          pagination: false,
          autoWidth: true,
          gap: "1rem",
          drag: "free",
          snap: true,
          speed: 650,
          easing: "cubic-bezier(.22,1,.36,1)",
          keyboard: "focused",
        }}
      >
        {items.map((anime, index) => (
          <SplideSlide
            key={`${id}-${anime.id}`}
            className={
              variant === "compact"
                ? "!w-[310px] md:!w-[360px]"
                : variant === "poster"
                ? "!w-[170px] md:!w-[210px]"
                : "!w-[280px] md:!w-[360px]"
            }
          >
            <AnimeCard anime={anime} variant={variant} rank={id.includes("trending") ? index + 1 : undefined} />
          </SplideSlide>
        ))}
      </Splide>
    </section>
  );
}