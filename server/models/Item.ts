export type WatchStatus = "watchlist" | "watched";

export interface Item {
  id: string;
  title: string;
  description: string;
  watchStatus: WatchStatus;
  rating: number | null;
  tmdbId?: number;
  posterPath?: string;
  releaseDate?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemInput {
  title: string;
  description: string;
  watchStatus?: WatchStatus;
  rating?: number | null;
  tmdbId?: number;
  posterPath?: string;
  releaseDate?: string;
}
