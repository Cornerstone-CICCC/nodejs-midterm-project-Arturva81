import { Router } from "express";

import { createItem, deleteItem, getItem, getTmdbMovieDetails, listItems, searchTmdbMovies, updateItem } from "../controllers/itemController.js";
import { requireAuth } from "../middleware/auth.js";

const itemRoutes = Router();

itemRoutes.get("/", requireAuth, listItems);
itemRoutes.get("/tmdb/search", requireAuth, searchTmdbMovies);
itemRoutes.get("/tmdb/:tmdbId", requireAuth, getTmdbMovieDetails);
itemRoutes.get("/:id", requireAuth, getItem);
itemRoutes.post("/", requireAuth, createItem);
itemRoutes.post("/:id", requireAuth, updateItem);
itemRoutes.post("/:id/delete", requireAuth, deleteItem);
itemRoutes.put("/:id", requireAuth, updateItem);
itemRoutes.delete("/:id", requireAuth, deleteItem);

export default itemRoutes;
