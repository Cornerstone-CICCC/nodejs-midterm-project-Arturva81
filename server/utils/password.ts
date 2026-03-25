import bcrypt from "bcrypt";
import zxcvbn from "zxcvbn";

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string) => bcrypt.hash(password, SALT_ROUNDS);

export const verifyPassword = async (password: string, passwordHash: string) => bcrypt.compare(password, passwordHash);

export const getPasswordStrength = (password: string) => zxcvbn(password).score;
