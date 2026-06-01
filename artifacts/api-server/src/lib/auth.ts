import crypto from "crypto";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "investpro_salt_2024").digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function generateToken(userId: number): string {
  return crypto.createHash("sha256").update(`${userId}:${Date.now()}:investpro_jwt_secret`).digest("hex");
}

export function generateReferralCode(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

const tokenStore = new Map<string, number>();

export function storeToken(token: string, userId: number): void {
  tokenStore.set(token, userId);
}

export function getUserIdFromToken(token: string): number | null {
  return tokenStore.get(token) ?? null;
}

export function removeToken(token: string): void {
  tokenStore.delete(token);
}
