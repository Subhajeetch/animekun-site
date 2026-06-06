import type { HomepageData } from "./home-types";

export const HOMEPAGE_REVALIDATE_SECONDS = 12 * 60 * 60;

function getApiBaseUrl(): string {
  return process.env.API_URL ?? "http://localhost:3001";
}

export async function getHomepageData(): Promise<HomepageData> {
  const response = await fetch(`${getApiBaseUrl()}/api/anilist/homepage`, {
    next: { revalidate: HOMEPAGE_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`Homepage API failed with status ${response.status}`);
  }

  return response.json() as Promise<HomepageData>;
}