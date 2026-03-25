import type { Response } from "express";

import { items } from "../data/store.js";
import type { Item } from "../models/Item.js";
import type { RequestWithSession } from "../types/session.js";
import { createId } from "../utils/ids.js";

const webBaseUrl = (process.env.WEB_BASE_URL ?? "http://localhost:4321").replace(/\/$/, "");
const toWebUrl = (path: string) => `${webBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;

const isValidWatchStatus = (status: string): status is Item["watchStatus"] => status === "watchlist" || status === "watched";

const parseRating = (value: unknown): { rating: number | null; error?: string } => {
  if (value === undefined || value === null || value === "") {
    return { rating: null };
  }

  const rating = Number(value);

  if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
    return { rating: null, error: "Rating must be between 0 and 5." };
  }

  if (!Number.isInteger(rating * 2)) {
    return { rating: null, error: "Rating must use 0.5 increments." };
  }

  return { rating };
};

const normalizeTmdbNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};

export const listItems = (req: RequestWithSession, res: Response) => {
  if (!req.session?.user) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  const userId = req.session.user.id;

  const query = String(req.query.q ?? "").trim().toLowerCase();
  const status = String(req.query.status ?? "").trim();
  const ownedItems = items.filter((item) => item.ownerId === userId);
  const filteredItems = query
    ? ownedItems.filter((item) => item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query))
    : ownedItems;

  const finalItems = isValidWatchStatus(status)
    ? filteredItems.filter((item) => item.watchStatus === status)
    : filteredItems;

  res.json(finalItems);
};

export const searchTmdbMovies = async (req: RequestWithSession, res: Response) => {
  const query = String(req.query.q ?? "").trim();

  if (!query) {
    res.status(400).json({ error: "Search query is required." });
    return;
  }

  const tmdbApiKey = process.env.TMDB_API_KEY;

  if (!tmdbApiKey) {
    res.status(500).json({ error: "TMDB API key is not configured." });
    return;
  }

  const searchParams = new URLSearchParams({
    api_key: tmdbApiKey,
    query,
    include_adult: "false",
    language: "en-US",
    page: "1"
  });

  const response = await fetch(`https://api.themoviedb.org/3/search/movie?${searchParams.toString()}`);

  if (!response.ok) {
    res.status(502).json({ error: "Failed to fetch data from TMDB." });
    return;
  }

  const data = (await response.json()) as {
    results?: Array<{
      id: number;
      title: string;
      overview: string;
      release_date: string;
      poster_path: string | null;
    }>;
  };

  const results = (data.results ?? []).map((movie) => ({
    tmdbId: movie.id,
    title: movie.title,
    description: movie.overview ?? "",
    releaseDate: movie.release_date ?? "",
    posterPath: movie.poster_path ?? ""
  }));

  res.json(results);
};

export const getTmdbMovieDetails = async (req: RequestWithSession, res: Response) => {
  const { tmdbId } = req.params;
    const tmdbMovieId = Array.isArray(tmdbId) ? tmdbId[0] : tmdbId;
  const tmdbApiKey = process.env.TMDB_API_KEY;

  if (!tmdbApiKey) {
    res.status(500).json({ error: "TMDB API key is not configured." });
    return;
  }

  const response = await fetch(
      `https://api.themoviedb.org/3/movie/${encodeURIComponent(tmdbMovieId)}?api_key=${encodeURIComponent(tmdbApiKey)}&append_to_response=credits`
  );

  if (!response.ok) {
    res.status(502).json({ error: "Failed to fetch data from TMDB." });
    return;
  }

  const data = (await response.json()) as {
    overview?: string;
    credits?: { crew?: Array<{ job: string; name: string }> };
  };

  const director = data.credits?.crew?.find((c) => c.job === "Director")?.name ?? "";
  const overview = data.overview ?? "";
  res.json({ director, overview });
};

export const getItem = (req: RequestWithSession, res: Response) => {
  if (!req.session?.user) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  const item = items.find((candidate) => candidate.id === req.params.id);

  if (!item) {
    res.status(404).json({ error: "Item not found." });
    return;
  }

  if (item.ownerId !== req.session.user.id) {
    res.status(403).json({ error: "You can only view your own items." });
    return;
  }

  res.json(item);
};

export const createItem = (req: RequestWithSession, res: Response) => {
  const {
    title,
    description = "",
    watchStatus: rawWatchStatus = "watchlist",
    rating: rawRating,
    tmdbId: rawTmdbId,
    posterPath = "",
    releaseDate = ""
  } = req.body as Record<string, string>;

  if (!req.session?.user) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  if (!title) {
    res.status(400).json({ error: "Title is required." });
    return;
  }

  if (!isValidWatchStatus(rawWatchStatus)) {
    res.status(400).json({ error: "Watch status must be watchlist or watched." });
    return;
  }

  const { rating, error: ratingError } = parseRating(rawRating);

  if (ratingError) {
    res.status(400).json({ error: ratingError });
    return;
  }

  const tmdbId = normalizeTmdbNumber(rawTmdbId);

  const newItem: Item = {
    id: createId(),
    title,
    description,
    watchStatus: rawWatchStatus,
    rating,
    tmdbId,
    posterPath: posterPath || undefined,
    releaseDate: releaseDate || undefined,
    ownerId: req.session.user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  items.push(newItem);
  res.redirect(303, toWebUrl("/items"));
};

export const updateItem = (req: RequestWithSession, res: Response) => {
  const item = items.find((candidate) => candidate.id === req.params.id);

  if (!item) {
    res.status(404).json({ error: "Item not found." });
    return;
  }

  if (item.ownerId !== req.session?.user?.id) {
    res.status(403).json({ error: "You can only edit your own items." });
    return;
  }

  const {
    title = item.title,
    description = item.description,
    watchStatus: rawWatchStatus = item.watchStatus,
    rating: rawRating = item.rating,
    tmdbId: rawTmdbId = item.tmdbId,
    posterPath = item.posterPath ?? "",
    releaseDate = item.releaseDate ?? ""
  } = req.body as Record<string, string>;

  if (!isValidWatchStatus(rawWatchStatus)) {
    res.status(400).json({ error: "Watch status must be watchlist or watched." });
    return;
  }

  const { rating, error: ratingError } = parseRating(rawRating);

  if (ratingError) {
    res.status(400).json({ error: ratingError });
    return;
  }

  const tmdbId = normalizeTmdbNumber(rawTmdbId);

  item.title = title;
  item.description = description;
  item.watchStatus = rawWatchStatus;
  item.rating = rating;
  item.tmdbId = tmdbId;
  item.posterPath = posterPath || undefined;
  item.releaseDate = releaseDate || undefined;
  item.updatedAt = new Date().toISOString();

  res.redirect(303, toWebUrl(`/items/${item.id}`));
};

export const deleteItem = (req: RequestWithSession, res: Response) => {
  const itemIndex = items.findIndex((candidate) => candidate.id === req.params.id);

  if (itemIndex === -1) {
    res.status(404).json({ error: "Item not found." });
    return;
  }

  if (items[itemIndex].ownerId !== req.session?.user?.id) {
    res.status(403).json({ error: "You can only delete your own items." });
    return;
  }

  items.splice(itemIndex, 1);
  res.redirect(303, toWebUrl("/items"));
};
