import crypto from "crypto";

const KEY_LENGTH = 64;

// scrypt via Node's built-in crypto — no external dependency needed for a
// single admin password. Stored as "<salt-hex>:<hash-hex>".
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

// Constant-time comparison of the derived hashes — a mismatched salt/hash
// format is treated as "wrong password" rather than throwing.
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;

  const candidateHash = crypto.scryptSync(password, salt, KEY_LENGTH);
  const storedHash = Buffer.from(hash, "hex");
  if (candidateHash.length !== storedHash.length) return false;

  return crypto.timingSafeEqual(candidateHash, storedHash);
}
