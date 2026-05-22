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
      `https://zenshin-supabase-api-myig.onrender.com/mappings?anilist_id=${anilistId}`,
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

    return NextResponse.json(data, {
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