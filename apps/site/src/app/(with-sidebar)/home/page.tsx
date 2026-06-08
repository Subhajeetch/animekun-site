import type { Metadata } from "next";
import { Clock3, Flame, Star, TrendingUp } from "lucide-react";
import AnimeRail from "./comp/AnimeRail";
import AnimeGrid from "./comp/AnimeGrid";
import GenreGrid from "./comp/GenreGrid";
import HeroSlider from "./comp/HeroSlider";
import TopByTimeTabs from "./comp/TopTen";
import { getHomepageData } from "./lib/home-api";
import type { HomepageData } from "./lib/home-types";
import { makeItemListJsonLd } from "./lib/home-utils";
import "./comp/some.css"

export const dynamic = 'force-dynamic';

const SITE_URL = "https://animekun.org";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "AnimeKun - Watch Trending Anime Online",
  description:
    "Explore trending anime, latest episodes, popular series, top-rated shows, and seasonal anime on AnimeKun.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AnimeKun - Watch Trending Anime Online",
    description:
      "Explore trending anime, latest episodes, popular series, top-rated shows, and seasonal anime on AnimeKun.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "AnimeKun - Watch Trending Anime Online",
    description:
      "Explore trending anime, latest episodes, popular series, top-rated shows, and seasonal anime on AnimeKun.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

function HomeErrorState() {
  return (
    <div className="min-h-screen bg-[#111] px-4 py-24 text-white md:px-10 lg:px-16">
      
      <section className="border border-zinc-800 bg-zinc-950 p-8" aria-labelledby="home-error-heading">
        <p className="mb-3 text-xs font-black uppercase text-red-500">Temporary issue</p>
        <h1 id="home-error-heading" className="text-3xl font-black">
          Homepage data is unavailable
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
          The anime feed could not be loaded right now. Please refresh in a moment.
        </p>
      </section>
    </div>
  );
}

export default async function HomePage() {
  let home: HomepageData;

  try {
    home = await getHomepageData();
  } catch (error) {
    console.error("[home] Failed to load homepage data:", error);
    return <HomeErrorState />;
  }

  const animePool = [
    ...home.trending,
    ...home.mostPopular.results,
    ...home.thisSeasonPopular.results,
  ];

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AnimeKun",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(makeItemListJsonLd(home.trending, SITE_URL)) }}
      />

      <HeroSlider items={home.spotlight} />
      <GenreGrid animePool={animePool} />

      <AnimeRail
        id="trending-anime"
        title="Trending Animes"
        icon={<TrendingUp className="h-5 w-5" aria-hidden="true" />}
        variant="poster"
        items={home.trending}
      />

      <div className="flex flex-col lg:flex-row gap-6 w-full">
        <div className="w-full lg:flex-1">
          <AnimeGrid
            id="this-season"
            title="Popular This Season"
            icon={<TrendingUp className="h-5 w-5" aria-hidden="true" />}
            variant="poster"
            items={home.thisSeasonPopular.results.slice(0, 18)}
          />
        </div>
        <div className="w-full lg:w-[435px] lg:shrink-0">
          <TopByTimeTabs items={home.topByTime} />
        </div>
      </div>


       <AnimeGrid
          id="top-rated"
          title={home.topRated.title}
          items={home.topRated.results}
          variant="poster"
        />

        <AnimeGrid
          id="most-popular"
          title={home.mostPopular.title}
          icon={<Star className="h-5 w-5" aria-hidden="true" />}
          items={home.mostPopular.results}
          variant="poster"
        />

        <AnimeGrid
          id="latest-episodes"
          title={home.latestEpisodes.title}
          icon={<Clock3 className="h-5 w-5" aria-hidden="true" />}
          items={home.latestEpisodes.results}
          variant="poster"
        />

      <div className="h-14" />
    </div>
  );
}