/* ──────────────────────────────────────────────
   Signed itinerary URLs (Phase 4)
   JWTs that let guests access their itinerary
   from an email link without re-authenticating.
   ────────────────────────────────────────────── */

import { SignJWT, jwtVerify } from "jose";

const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getSecret() {
  const secret = process.env.ITINERARY_SIGNING_SECRET;
  if (!secret) throw new Error("ITINERARY_SIGNING_SECRET is not set");
  return new TextEncoder().encode(secret);
}

/** Generate a signed itinerary URL for a guest */
export async function generateSignedUrl(guestId: string): Promise<string> {
  const token = await new SignJWT({ sub: guestId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret());

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://teamaf.wedding";
  return `${base}/itinerary?token=${token}`;
}

/** Verify a signed itinerary token. Returns guest ID or null. */
export async function verifySignedToken(
  token: string
): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return (payload.sub as string) ?? null;
  } catch {
    return null;
  }
}
