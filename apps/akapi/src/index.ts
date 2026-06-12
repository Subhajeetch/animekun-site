import { Hono } from "hono";
import { cors } from "hono/cors";

// routes import
import { getAnimeDetail, homepage, getAnimeByGenre } from "./routes/index.js";


const app = new Hono<{}>();

app.use("*", async (c, next) => {
  return cors({
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })(c, next);
});

app.get("/api/health", () => {
  return new Response("OK");
});

//routes
app.route("/api/anilist/", getAnimeDetail);
app.route("/api/anilist/", homepage);
app.route("/api/anilist/", getAnimeByGenre);
export default app;
