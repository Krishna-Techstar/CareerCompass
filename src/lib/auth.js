import crypto from "crypto";

/**
 * Hashes a plaintext password using standard scrypt with a random 16-byte salt.
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

/**
 * Verifies a plaintext password against a stored scrypt hash and salt in constant time.
 */
export function verifyPassword(password, hash, salt) {
  try {
    const testHash = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(testHash, "hex"));
  } catch (err) {
    return false;
  }
}

/**
 * Generates a cryptographically secure random session token.
 */
export function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Extracts a session token from request cookies or Authorization header.
 */
export function getSessionTokenFromRequest(req) {
  // 1. Check cookies
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      if (key && value) acc[key] = decodeURIComponent(value);
      return acc;
    }, {});

    if (cookies.career_compass_session) {
      return cookies.career_compass_session;
    }
  } catch (e) {}

  // 2. Check Authorization: Bearer <token>
  try {
    const authHeader = req.headers.get("authorization") || "";
    if (authHeader.startsWith("Bearer ")) {
      return authHeader.slice(7).trim();
    }
  } catch (e) {}

  return null;
}
