import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export interface Episode {
  episode: number;
  title: string;
  simklEpisodeId: string;
  hasDub: boolean;
  isScr: boolean; // unknown flag seen on SIMKL, possibly "screened/available" — capture for now
}

export interface EpisodesResponse {
  simklId: string;
  slug: string;
  total: number;
  episodes: Episode[];
}

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ simklId: string }> }
) {
  const { simklId } = await context.params;

  if (!simklId || !/^\d+$/.test(simklId)) {
    return NextResponse.json({ error: "Invalid simklId" }, { status: 400 });
  }

  try {
    // Step 1: Fetch the anime base page to resolve the slug via redirect
    // e.g. simkl.com/anime/38636 → simkl.com/anime/38636/one-piece/
    const baseRes = await fetch(`https://simkl.com/anime/${simklId}`, {
      headers: HEADERS,
      redirect: "follow",
    });

    console.log(`Fetched base page for SIMKL ID ${simklId}, status: ${baseRes.status}`);
    if (!baseRes.ok) {
      return NextResponse.json(
        { error: `SIMKL returned ${baseRes.status} for anime page` },
        { status: 502 }
      );
    }

    // Extract slug from final redirected URL
    const finalUrl = baseRes.url;
    const slugMatch = finalUrl.match(/\/anime\/\d+\/([^/]+)\//);
    if (!slugMatch) {
      return NextResponse.json(
        { error: "Could not resolve anime slug from redirect URL", finalUrl },
        { status: 502 }
      );
    }
    const slug: string = slugMatch[1]!;

    // Step 2: Fetch the episodes page
    const episodesUrl = `https://simkl.com/anime/${simklId}/${slug}/episodes/`;
    const episodesRes = await fetch(episodesUrl, {
      headers: {
        ...HEADERS,
        Referer: `https://simkl.com/anime/${simklId}/${slug}/`,
      },
    });

    if (!episodesRes.ok) {
      return NextResponse.json(
        { error: `SIMKL returned ${episodesRes.status} for episodes page` },
        { status: 502 }
      );
    }

    const html = await episodesRes.text();

    // Step 3: Parse with cheerio
    const $ = cheerio.load(html);
    const episodes: Episode[] = [];

    $(".SimklTVAboutTabsDetailsDiv.goEpisode").each((_, el) => {
      const div = $(el);

      const simklEpisodeId = div.attr("data-id") ?? "";
      const hasDub = div.hasClass("has-dub");
      const isScr = div.hasClass("eScr");

      const epNumberRaw = div.find(".SimklTVEpisodesEpNumber").text().trim();
      // "Ep. 01" → 1
      const episode = parseInt(epNumberRaw.replace(/[^0-9]/g, ""), 10);

      const title = div.find(".SimklTVEpisodesEpTitle").text().trim();

      episodes.push({
        episode: isNaN(episode) ? 0 : episode,
        title,
        simklEpisodeId,
        hasDub,
        isScr,
      });
    });

    if (episodes.length === 0) {
      // Page loaded but nothing parsed — likely Cloudflare blocked the request
      return NextResponse.json(
        {
          error:
            "No episodes found. SIMKL may have blocked the request (Cloudflare). Try adding cookies to the request headers.",
          simklId,
          slug,
          episodesUrl,
        },
        { status: 503 }
      );
    }

    const response: EpisodesResponse = {
      simklId,
      slug,
      total: episodes.length,
      episodes,
    };

    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json(
      { error: "Internal error", detail: String(err) },
      { status: 500 }
    );
  }
}