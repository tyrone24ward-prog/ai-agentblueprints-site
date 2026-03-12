import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

export const hashPassword = async (password: string) => {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
};

export const verifyPassword = async (password: string, encodedHash: string) => {
  const [salt, stored] = encodedHash.split(":");
  if (!salt || !stored) {
    return false;
  }

  const candidate = (await scrypt(password, salt, 64)) as Buffer;
  const storedBuffer = Buffer.from(stored, "hex");

  if (candidate.length !== storedBuffer.length) {
    return false;
  }

  return timingSafeEqual(candidate, storedBuffer);
};
