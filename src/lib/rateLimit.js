// In-memory sliding window rate limiter
const ipRequests = new Map();

/**
 * Checks if the request from the given IP exceeds the limit.
 * @param {string} ip - Client IP address
 * @param {number} limit - Maximum requests allowed in the time window (default: 45)
 * @param {number} windowMs - Time window in milliseconds (default: 60s)
 * @returns {boolean} true if allowed, false if rate limited
 */
export function checkRateLimit(ip, limit = 45, windowMs = 60 * 1000) {
  const now = Date.now();
  const timestamps = ipRequests.get(ip) || [];

  // Filter timestamps within current window
  const validTimestamps = timestamps.filter((t) => now - t < windowMs);

  if (validTimestamps.length >= limit) {
    ipRequests.set(ip, validTimestamps);
    return false;
  }

  validTimestamps.push(now);
  ipRequests.set(ip, validTimestamps);

  // Periodic cleanup if map grows
  if (ipRequests.size > 2000) {
    for (const [key, times] of ipRequests.entries()) {
      if (times.every((t) => now - t >= windowMs)) {
        ipRequests.delete(key);
      }
    }
  }

  return true;
}

/**
 * Extracts client IP safely from request headers
 */
export function getClientIp(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}
