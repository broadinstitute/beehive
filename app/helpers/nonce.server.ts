import { randomBytes } from "crypto";

export function generateNonce(): string {
  return randomBytes(32).toString("base64url");
}
