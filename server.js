const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// DB POOL
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

app.get("/api/search", async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.status(400).json({ message: "q need Query" });

  try {
    const r = await axios.get("https://api.jikan.moe/v4/anime", {
      params: { q, limit: 10 },
    });
    const items = r.data?.data || [];

    for (const it of items) {
      const mal_id = it.mal_id;
      if (!mal_id) continue;
      const title = it.title || it.titles?.[0]?.title || "";
      const genre = (it.genres || []).map((g) => g.genre).join(", ");
      const episodes = it.episodes || 0;
      const rating = it.score || 0;
      const release_date = it.aired?.from
        ? it.aired.from.substring(0, 10)
        : null;
      const img_url =
        it.images?.jpg?.image_url || it.images?.webp?.image_url || null;

      await db.query(
        `INSERT INTO animes (mal_id, title, genre, episodes, rating, release_date, img_url)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           title=VALUES(title), genre=VALUES(genre), episodes=VALUES(episodes),
           rating=VALUES(rating), release_date=VALUES(release_date), img_url=VALUES(img_url)`,
        [mal_id, title, genre, episodes, rating, release_date, img_url]
      );
    }

    const results = items
      .filter((it) => it.mal_id)
      .map((it) => ({
        mal_id: it.mal_id,
        title: it.title,
        genres: (it.genres || []).map((g) => g.name),
        episodes: it.episodes,
        score: it.score,
        release_date: it.aired?.from,
        img_url: it.images?.jpg?.image_url || it.images?.webp?.image_url || "",
      }));

    res.json(results);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Search Failed", error: err.message });
  }
});

app.get("/api/animes", async (_req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM animes ORDER BY last_update DESC LIMIT 100"
  );
  res.json(rows);
});

app.post("/api/animes/:mal_id/like", async (req, res) => {
  const mal_id = Number(req.params.mal_id);
  if (!mal_id) return res.status(400).json({ message: "Not Found ID" });

  try {
    const [[anime]] = await db.query("SELECT id FROM animes WHERE mal_id = ?", [
      mal_id,
    ]);
    if (!anime) return res.status(404).json({ message: "Anime Not Found" });

    await db.query(
      "INSERT IGNORE INTO user_likes (user_id, anime_id) VALUES (1, ?)",
      [anime.id]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: "like Failed", error: e.message });
  }
});

app.get("/api/user/me/likes", async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.id, a.mal_id, a.title, a.genre, a.episodes, a.rating as score, a.release_date,
           IFNULL(a.img_url, '') as img_url
       FROM user_likes ul 
       JOIN animes a ON ul.anime_id = a.id 
       WHERE ul.user_id = 1 
       ORDER BY ul.id DESC`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: "Failed to get likes", error: e.message });
  }
});

app.get("/api/animes/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [[row]] = await db.query("SELECT * FROM animes WHERE id = ?", [id]);
  if (!row) return res.status(404).json({ message: "Not Found" });
  res.json(row);
});

const port = process.env.PORT || 5000;
app.listen(port, () =>
  console.log(`server is running: http://localhost:${port}`)
);
