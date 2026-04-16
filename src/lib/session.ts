/* ──────────────────────────────────────────────
   Guest session management (JWT in HTTP-only cookie)
   Edge-runtime compatible via `jose`
   ────────────────────────────────────────────── */

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "guest_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  const secret = process.env.GUEST_SESSION_SECRET;
  if (!secret) throw new Error("GUEST_SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

/** Sign a JWT containing the guest ID */
export async function signGuestToken(guestId: string): Promise<string> {
  return new SignJWT({ sub: guestId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret());
}

/** Verify a JWT and return the guest ID, or null if invalid/expired */
export async function verifyGuestToken(
  token: string
): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return (payload.sub as string) ?? null;
  } catch {
    return null;
  }
}

/** Set the guest session cookie (call from server actions) */
export async function setGuestCookie(guestId: string): Promise<void> {
  const token = await signGuestToken(guestId);
  const cookieStore = await cookies();
  try {
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE,
    });
  } catch {
    // Can throw in Server Components — safe to swallow in that context
  }
}

/** Read the guest session cookie and return the guest ID, or null */
export async function getGuestFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie?.value) return null;
  return verifyGuestToken(cookie.value);
}

/** Clear the guest session cookie */
export async function clearGuestCookie(): Promise<void> {
  const cookieStore = await cookies();
  try {
    cookieStore.delete(COOKIE_NAME);
  } catch {
    // Safe to swallow
  }
}
