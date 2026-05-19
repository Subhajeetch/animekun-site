// app/api/anilist/route.ts
import { NextRequest, NextResponse } from "next/server";

const ANILIST_URL = "https://anilist.co/graphql";

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const forwardedHeaders: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    // Mimic a real browser request from the AniList site itself
    "Origin": "https://anilist.co",
    "Referer": "https://anilist.co/",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  };

  // Forward auth token if the user is logged in
  const auth = req.headers.get("Authorization");
  if (auth) {
    forwardedHeaders["Authorization"] = auth;
  }

  let res: Response;

  try {
    res = await fetch(ANILIST_URL, {
      method: "POST",
      headers: forwardedHeaders,
      body: JSON.stringify(body),
    });
  } catch (networkError) {
    console.error("← AniList network error:", networkError);
    return NextResponse.json(
      { error: "Failed to reach AniList API" },
      { status: 502 }
    );
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    console.error("← AniList non-JSON response:", text);
    return NextResponse.json(
      { error: "Unexpected response from AniList", detail: text },
      { status: 502 }
    );
  }

  const json = await res.json();

  if (process.env.NODE_ENV === "development") {
    console.log("← AniList response:", JSON.stringify(json, null, 2));
  }

  return NextResponse.json(json, { status: res.status });
}