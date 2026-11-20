import fs from "fs";
import path from "path";
import os from "os";
import { hashPassword, verifyPassword, generateToken } from "./auth.js";

// Database storage location (persisted JSON document database)
const PRIMARY_DB_PATH = path.join(process.cwd(), "src", "data", "users_db.json");
const FALLBACK_DB_PATH = path.join(os.tmpdir(), "career_compass_users_db.json");

let activeDbPath = null;

function getDbPath() {
  if (activeDbPath) return activeDbPath;

  try {
    const primaryDir = path.dirname(PRIMARY_DB_PATH);
    if (!fs.existsSync(primaryDir)) {
      fs.mkdirSync(primaryDir, { recursive: true });
    }
    // Test write permission
    if (!fs.existsSync(PRIMARY_DB_PATH)) {
      fs.writeFileSync(
        PRIMARY_DB_PATH,
        JSON.stringify({ users: [], sessions: [] }, null, 2),
        "utf-8"
      );
    }
    activeDbPath = PRIMARY_DB_PATH;
    return activeDbPath;
  } catch (err) {
    // In serverless / read-only filesystem, use OS temp directory
    try {
      if (!fs.existsSync(FALLBACK_DB_PATH)) {
        fs.writeFileSync(
          FALLBACK_DB_PATH,
          JSON.stringify({ users: [], sessions: [] }, null, 2),
          "utf-8"
        );
      }
      activeDbPath = FALLBACK_DB_PATH;
      return activeDbPath;
    } catch (e) {
      activeDbPath = PRIMARY_DB_PATH;
      return activeDbPath;
    }
  }
}

// In-memory cache for fast read/write synchronization
let dbCache = null;

function readDb() {
  if (dbCache) return dbCache;

  const filePath = getDbPath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      dbCache = JSON.parse(raw);
    } else {
      dbCache = { users: [], sessions: [] };
    }
  } catch (err) {
    dbCache = { users: [], sessions: [] };
  }

  if (!dbCache.users) dbCache.users = [];
  if (!dbCache.sessions) dbCache.sessions = [];

  return dbCache;
}

function writeDb(data) {
  dbCache = data;
  const filePath = getDbPath();
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    // Fallback to tmpdir if primary path failed
    try {
      fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(data, null, 2), "utf-8");
      activeDbPath = FALLBACK_DB_PATH;
    } catch (e) {
      console.error("[DB] Failed to persist data to disk:", e.message);
    }
  }
}

/**
 * Strips passwordHash and salt before returning user to client.
 */
export function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, salt, ...safeUser } = user;
  return safeUser;
}

/**
 * Finds user by email address (case-insensitive).
 */
export function getUserByEmail(email) {
  if (!email) return null;
  const db = readDb();
  const normalized = String(email).trim().toLowerCase();
  return db.users.find((u) => u.email.toLowerCase() === normalized) || null;
}

/**
 * Finds user by their unique ID.
 */
export function getUserById(id) {
  if (!id) return null;
  const db = readDb();
  return db.users.find((u) => u.id === id) || null;
}

/**
 * Creates a new user record with hashed password and structured profile JSON.
 */
export function createUser({ email, password, profile = {} }) {
  const db = readDb();
  const normalizedEmail = String(email).trim().toLowerCase();

  if (getUserByEmail(normalizedEmail)) {
    throw new Error("An account with this email already exists.");
  }

  const { hash, salt } = hashPassword(password);
  const userId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const newUser = {
    id: userId,
    email: normalizedEmail,
    passwordHash: hash,
    salt: salt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profile: {
      name: profile.name || "",
      age: profile.age ? Number(profile.age) : null,
      classLevel: profile.classLevel || "",
      highestEducation: profile.highestEducation || "",
      institution: profile.institution || "",
      stream: profile.stream || "",
      address: {
        city: profile.address?.city || profile.city || "",
        state: profile.address?.state || profile.state || "",
        pincode: profile.address?.pincode || profile.pincode || "",
        country: profile.address?.country || "India",
      },
      aspirations: profile.aspirations || "",
    },
  };

  db.users.push(newUser);
  writeDb(db);

  return sanitizeUser(newUser);
}

/**
 * Updates a user's profile data in JSON format and persists to DB.
 */
export function updateUserProfile(userId, profileUpdate) {
  const db = readDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    throw new Error("User not found.");
  }

  const existing = user.profile || {};
  user.profile = {
    ...existing,
    name: profileUpdate.name !== undefined ? String(profileUpdate.name).trim() : existing.name,
    age:
      profileUpdate.age !== undefined
        ? profileUpdate.age === "" || profileUpdate.age === null
          ? null
          : Number(profileUpdate.age)
        : existing.age,
    classLevel:
      profileUpdate.classLevel !== undefined
        ? String(profileUpdate.classLevel).trim()
        : existing.classLevel,
    highestEducation:
      profileUpdate.highestEducation !== undefined
        ? String(profileUpdate.highestEducation).trim()
        : existing.highestEducation,
    institution:
      profileUpdate.institution !== undefined
        ? String(profileUpdate.institution).trim()
        : existing.institution,
    stream:
      profileUpdate.stream !== undefined ? String(profileUpdate.stream).trim() : existing.stream,
    address: {
      city:
        profileUpdate.city !== undefined
          ? String(profileUpdate.city).trim()
          : profileUpdate.address?.city !== undefined
          ? String(profileUpdate.address.city).trim()
          : existing.address?.city || "",
      state:
        profileUpdate.state !== undefined
          ? String(profileUpdate.state).trim()
          : profileUpdate.address?.state !== undefined
          ? String(profileUpdate.address.state).trim()
          : existing.address?.state || "",
      pincode:
        profileUpdate.pincode !== undefined
          ? String(profileUpdate.pincode).trim()
          : profileUpdate.address?.pincode !== undefined
          ? String(profileUpdate.address.pincode).trim()
          : existing.address?.pincode || "",
      country:
        profileUpdate.country !== undefined
          ? String(profileUpdate.country).trim()
          : profileUpdate.address?.country !== undefined
          ? String(profileUpdate.address.country).trim()
          : existing.address?.country || "India",
    },
    aspirations:
      profileUpdate.aspirations !== undefined
        ? String(profileUpdate.aspirations).trim()
        : existing.aspirations,
  };

  user.updatedAt = new Date().toISOString();
  writeDb(db);

  return sanitizeUser(user);
}

/**
 * Creates a session for an authenticated user and saves to DB.
 */
export function createSession(userId) {
  const db = readDb();
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

  const newSession = {
    token,
    userId,
    createdAt: new Date().toISOString(),
    expiresAt,
  };

  db.sessions.push(newSession);
  writeDb(db);

  return token;
}

/**
 * Retrieves a user by their active session token.
 */
export function getUserBySession(token) {
  if (!token) return null;
  const db = readDb();

  const session = db.sessions.find((s) => s.token === token);
  if (!session) return null;

  // Check expiration
  if (new Date(session.expiresAt) < new Date()) {
    deleteSession(token);
    return null;
  }

  const user = db.users.find((u) => u.id === session.userId);
  return sanitizeUser(user);
}

/**
 * Deletes a session token upon signout.
 */
export function deleteSession(token) {
  if (!token) return;
  const db = readDb();
  db.sessions = db.sessions.filter((s) => s.token !== token);
  writeDb(db);
}
