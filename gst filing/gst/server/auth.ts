import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import db from "./db";
import { users, userSessions } from "../shared/schema";
import { eq, and, gt } from "drizzle-orm";
import { randomUUID } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_here_make_it_very_secure_for_production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: "gst-filing-app",
    audience: "gst-filing-users"
  });
}

// Verify JWT token
export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "gst-filing-app",
      audience: "gst-filing-users"
    }) as jwt.JwtPayload;
    return { userId: decoded.userId, email: decoded.email };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

// Create user session in database
export async function createUserSession(
  userId: string,
  sessionToken: string,
  deviceInfo?: string,
  ipAddress?: string
) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  try {
    const sessionId = randomUUID();
    await db.insert(userSessions).values({
      id: sessionId,
      userId,
      sessionToken,
      deviceInfo,
      ipAddress,
      expiresAt,
    });

    // Get the created session
    const [session] = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.id, sessionId))
      .limit(1);

    return session;
  } catch (error) {
    console.error("Failed to create user session:", error);
    throw error;
  }
}

// Get valid user session
export async function getUserSession(sessionToken: string) {
  try {
    const [session] = await db
      .select()
      .from(userSessions)
      .where(
        and(
          eq(userSessions.sessionToken, sessionToken),
          gt(userSessions.expiresAt, new Date())
        )
      )
      .limit(1);

    return session || null;
  } catch (error) {
    console.error("Failed to get user session:", error);
    return null;
  }
}

// Delete user session (logout)
export async function deleteUserSession(sessionToken: string) {
  try {
    await db
      .delete(userSessions)
      .where(eq(userSessions.sessionToken, sessionToken));
    return true;
  } catch (error) {
    console.error("Failed to delete user session:", error);
    return false;
  }
}

// Cleanup expired sessions
export async function cleanupExpiredSessions() {
  try {
    const result = await db
      .delete(userSessions)
      .where(eq(userSessions.expiresAt, new Date()));
    console.log(`Cleaned up expired sessions: ${result.changes} sessions removed`);
  } catch (error) {
    console.error("Failed to cleanup expired sessions:", error);
  }
}

// Authentication middleware
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    company?: string;
    gstin?: string;
  };
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    // Verify JWT token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    // Check if session exists and is valid
    const session = await getUserSession(token);
    if (!session) {
      return res.status(403).json({ error: "Session expired or invalid" });
    }

    // Get user data from database
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        company: users.company,
        gstin: users.gstin,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!user || !user.isActive) {
      return res.status(403).json({ error: "User not found or inactive" });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(403).json({ error: "Token verification failed" });
  }
}

// Optional authentication middleware (doesn't fail if no token)
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next(); // Continue without user
  }

  try {
    const decoded = verifyToken(token);
    if (decoded) {
      const session = await getUserSession(token);
      if (session) {
        const [user] = await db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            company: users.company,
            gstin: users.gstin,
          })
          .from(users)
          .where(eq(users.id, decoded.userId))
          .limit(1);

        if (user) {
          req.user = user;
        }
      }
    }
  } catch (error) {
    console.error("Optional auth error:", error);
  }

  next();
}

// Get device info from request
export function getDeviceInfo(req: Request): string {
  const userAgent = req.headers["user-agent"] || "Unknown";
  const platform = req.headers["sec-ch-ua-platform"] || "Unknown";
  return `${userAgent} (${platform})`;
}

// Get client IP address
export function getClientIP(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    "Unknown"
  );
}