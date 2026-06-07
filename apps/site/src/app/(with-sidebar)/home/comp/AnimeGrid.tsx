"use client";

import type { ReactNode } from "react";
import type { HomepageAnime, LatestEpisodeAnime } from "../lib/home-types";
import AnimeCard from "./AnimeCard";
import SectionTitle from "./SectionTitle";

interface AnimeGridProps {
  id: string;
  title: string;
  icon?: ReactNode;
  items: Array<HomepageAnime | LatestEpisodeAnime>;
  variant?: "wide" | "poster" | "compact";
}

export default function AnimeGrid({ id, title, icon, items, variant = "wide" }: AnimeGridProps) {
  if (items.length === 0) return null;

  return (
    <section className="px-2 mt-6" aria-labelledby={id}>
      <SectionTitle id={id} icon={icon}>
        {title}
      </SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {items.map((anime, index) => (
          <div key={`${id}-${anime.id}`} className="mb-4 last:mb-0">
            <AnimeCard anime={anime} variant={variant} />
          </div>
        ))}
      </div>
    </section>
  );
}