import type { NextFunction, Response } from "express";

import type { RequestWithSession } from "../types/session.js";

export const requireAuth = (req: RequestWithSession, res: Response, next: NextFunction) => {
  if (!req.session?.user) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  next();
};
