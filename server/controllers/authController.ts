import type { Response } from "express";

import { users } from "../data/store.js";
import type { User } from "../models/User.js";
import type { RequestWithSession } from "../types/session.js";
import { createId } from "../utils/ids.js";
import { getPasswordStrength, hashPassword, verifyPassword } from "../utils/password.js";

const webBaseUrl = (process.env.WEB_BASE_URL ?? "http://localhost:4321").replace(/\/$/, "");
const toWebUrl = (path: string) => `${webBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;

export const register = async (req: RequestWithSession, res: Response) => {
  const { name, email, password } = req.body as Record<string, string>;

  if (!name || !email || !password) {
    res.status(400).json({ error: "Name, email, and password are required." });
    return;
  }

  if (users.some((user) => user.email === email)) {
    res.status(409).json({ error: "A user with that email already exists." });
    return;
  }

  if (getPasswordStrength(password) < 3) {
    res.status(400).json({ error: "Password is too weak." });
    return;
  }

  const newUser: User = {
    id: createId(),
    name,
    email,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString()
  };

  users.push(newUser);

  req.session = {
    user: {
      id: newUser.id,
      email: newUser.email
    }
  };

  res.redirect(303, toWebUrl("/items"));
};

export const login = async (req: RequestWithSession, res: Response) => {
  const { email, password } = req.body as Record<string, string>;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  const user = users.find((candidate) => candidate.email === email);

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    res.status(401).json({ error: "Invalid credentials." });
    return;
  }

  req.session = {
    user: {
      id: user.id,
      email: user.email
    }
  };

  res.redirect(303, toWebUrl("/items"));
};

export const logout = (req: RequestWithSession, res: Response) => {
  req.session = null;
  res.status(204).send();
};

export const me = (req: RequestWithSession, res: Response) => {
  if (!req.session?.user) {
    res.status(401).json({ error: "Not logged in." });
    return;
  }

  const user = users.find((candidate) => candidate.id === req.session?.user?.id);

  if (!user) {
    res.status(404).json({ error: "User not found." });
    return;
  }

  res.json({ id: user.id, name: user.name, email: user.email });
};
