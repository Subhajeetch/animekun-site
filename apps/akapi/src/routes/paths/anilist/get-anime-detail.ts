import { Hono } from "hono";

import { getAnime } from "../../../utils/get-anime-detail.js";
import { searchAnimes } from "../../../utils/search-animes.js";
import type { SearchAnimesParams } from "@repo/anilist";

const getAnimeDetail = new Hono<{}>();

getAnimeDetail.get("/search/animes", async (c) => {
    const query = c.req.query("query")?.trim();

    if (!query) {
        return c.json({ error: "Missing query parameter" }, 400);
    }

    const page = Number(c.req.query("page") ?? 1);
    const perPage = Number(c.req.query("perPage") ?? 20);

    const searchParams: SearchAnimesParams = {
        query,
        page: Number.isFinite(page) && page > 0 ? page : 1,
        perPage: Number.isFinite(perPage) && perPage > 0 ? perPage : 20,
    };

    try {
        const animes = await searchAnimes(searchParams);
        return c.json(animes);
    } catch (error) {
        console.error("Error searching anime:", error);
        return c.json({ error: "Failed to search anime" }, 500);
    }
});

//search products by keyword
getAnimeDetail.get("/anime/:id", async (c) => {
    const { id } = c.req.param();
    try {
        const anime = await getAnime(Number(id));
        return c.json(anime);
    } catch (error) {
        console.error("Error fetching anime details:", error);
        return c.json({ error: "Failed to fetch anime details" }, 500);
    }
 
});


export default getAnimeDetail;
