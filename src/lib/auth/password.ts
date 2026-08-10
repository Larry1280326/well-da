import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEYLEN = 64; // 512-bit hash output

/**
 * Hash a password using scrypt with a random 16-byte salt.
 * Returns "salt_hex:hash_hex" — safe to store in the database.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a stored "salt_hex:hash_hex" string.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const computed = scryptSync(password, salt, KEYLEN);
  const expected = Buffer.from(hash, "hex");
  if (computed.length !== expected.length) return false;
  return timingSafeEqual(computed, expected);
}
