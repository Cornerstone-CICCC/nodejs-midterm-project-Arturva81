import type { Request } from "express";

export interface SessionUser {
  id: string;
  email: string;
}

export type RequestWithSession = Request & {
  session?: {
    user?: SessionUser;
  } | null;
};
