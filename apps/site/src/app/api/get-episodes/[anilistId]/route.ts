import { NextRequest, NextResponse } from 'next/server';
import { AnimeEpisodesResponse } from '@/types/watch';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ anilistId: string }> }
) {
  const { anilistId } = await params;

  if (!anilistId || isNaN(Number(anilistId))) {
    return NextResponse.json(
      { error: 'Invalid anilistId' },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://api.ani.zip/mappings?anilist_id=${anilistId}`,
      { next: { revalidate: 3600 } }
    );

    //console.log(res);

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${res.status}` },
        { status: res.status }
      );
    }

    const data: AnimeEpisodesResponse = await res.json();

    // Ani.zip returns episodes as an object keyed by episode number and does
    // not include the internal `type` field used by the watch page.
    const episodes = Object.fromEntries(
      Object.entries(data.episodes ?? {}).map(([key, episode]) => [
        key,
        {
          ...episode,
          episode: String(episode.episode ?? key),
          type: episode.type ?? 'Regular Episode',
        },
      ])
    );

    return NextResponse.json({ ...data, episodes }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    console.error('[get-episodes] fetch error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch episode data' },
      { status: 500 }
    );
  }
}