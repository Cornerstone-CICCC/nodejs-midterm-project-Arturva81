import { Router } from "express";

import { login, logout, me, register } from "../controllers/authController.js";

const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.get("/me", me);

export default authRoutes;
