import { Router } from "express";
import { eq, and } from "drizzle-orm";
import db from "./db";
import { users, auditLogs } from "../shared/schema";
import { insertUserSchema, loginSchema } from "../shared/schema";
import {
  hashPassword,
  verifyPassword,
  generateToken,
  createUserSession,
  deleteUserSession,
  authenticateToken,
  getDeviceInfo,
  getClientIP,
  type AuthenticatedRequest,
} from "./auth";
import { randomUUID } from "crypto";

const router = Router();

// Signup endpoint - Creates account but doesn't log in
router.post("/signup", async (req, res) => {
  try {
    // Validate request body
    const validation = insertUserSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid input data",
        details: validation.error.errors,
      });
    }

    const { email, password, name, company, gstin, panNumber, phoneNumber, address } = validation.data;

    // Check if user already exists
    const [existingUser] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser) {
      return res.status(409).json({
        error: "Account already exists",
        message: "An account with this email already exists. Please sign in instead.",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user account
    const userId = randomUUID();
    await db
      .insert(users)
      .values({
        id: userId,
        email: email.toLowerCase(),
        name,
        company,
        gstin,
        panNumber,
        password: hashedPassword,
        phoneNumber,
        address,
        isActive: true,
        isEmailVerified: false,
      });

    // Get the created user
    const [newUser] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        company: users.company,
        gstin: users.gstin,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Log the signup action
    await db.insert(auditLogs).values({
      userId: newUser.id,
      action: "user_signup",
      entityType: "user",
      entityId: newUser.id,
      newData: {
        email: newUser.email,
        name: newUser.name,
        company: newUser.company,
      },
      ipAddress: getClientIP(req),
      userAgent: req.headers["user-agent"],
    });

    console.log(`✅ New user registered: ${newUser.email}`);

    // Return success but don't provide token (user must sign in)
    res.status(201).json({
      success: true,
      message: "Account created successfully! Please sign in to continue.",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        company: newUser.company,
        gstin: newUser.gstin,
      },
      redirectTo: "/signin",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      error: "Failed to create account",
      message: "An internal server error occurred. Please try again.",
    });
  }
});

// Signin endpoint - Authenticates and provides access token
router.post("/signin", async (req, res) => {
  try {
    // Validate request body
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid input data",
        details: validation.error.errors,
      });
    }

    const { email, password } = validation.data;

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "No account found with this email address.",
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        error: "Account deactivated",
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "Incorrect password. Please try again.",
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    // Create session in database
    const deviceInfo = getDeviceInfo(req);
    const ipAddress = getClientIP(req);
    
    await createUserSession(user.id, token, deviceInfo, ipAddress);

    // Update last login time
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    // Log the signin action
    await db.insert(auditLogs).values({
      userId: user.id,
      action: "user_signin",
      entityType: "user",
      entityId: user.id,
      newData: {
        loginTime: new Date(),
        deviceInfo,
        ipAddress,
      },
      ipAddress,
      userAgent: req.headers["user-agent"],
    });

    console.log(`✅ User signed in: ${user.email}`);

    // Return user data and token
    res.json({
      success: true,
      message: "Signed in successfully!",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
        gstin: user.gstin,
        panNumber: user.panNumber,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        role: user.role,
        lastLoginAt: user.lastLoginAt,
      },
      redirectTo: "/dashboard",
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({
      error: "Failed to sign in",
      message: "An internal server error occurred. Please try again.",
    });
  }
});

// Logout endpoint
router.post("/logout", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      // Delete session from database
      await deleteUserSession(token);

      // Log the logout action
      if (req.user) {
        await db.insert(auditLogs).values({
          userId: req.user.id,
          action: "user_logout",
          entityType: "user",
          entityId: req.user.id,
          newData: {
            logoutTime: new Date(),
          },
          ipAddress: getClientIP(req),
          userAgent: req.headers["user-agent"],
        });

        console.log(`✅ User logged out: ${req.user.email}`);
      }
    }

    res.json({
      success: true,
      message: "Logged out successfully",
      redirectTo: "/signin",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      error: "Failed to logout",
      message: "An error occurred during logout.",
    });
  }
});

// Get current user profile
router.get("/me", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Get fresh user data from database
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        company: users.company,
        gstin: users.gstin,
        panNumber: users.panNumber,
        phoneNumber: users.phoneNumber,
        address: users.address,
        avatar: users.avatar,
        role: users.role,
        isEmailVerified: users.isEmailVerified,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      error: "Failed to get user profile",
    });
  }
});

// Update user profile
router.put("/profile", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not found" });
    }

    const { name, company, gstin, panNumber, phoneNumber, address } = req.body;

    // Update user profile
    await db
      .update(users)
      .set({
        name,
        company,
        gstin,
        panNumber,
        phoneNumber,
        address,
        updatedAt: new Date(),
      })
      .where(eq(users.id, req.user.id));

    // Get the updated user
    const [updatedUser] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        company: users.company,
        gstin: users.gstin,
        panNumber: users.panNumber,
        phoneNumber: users.phoneNumber,
        address: users.address,
      })
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    // Log the profile update
    await db.insert(auditLogs).values({
      userId: req.user.id,
      action: "profile_update",
      entityType: "user",
      entityId: req.user.id,
      newData: updatedUser,
      ipAddress: getClientIP(req),
      userAgent: req.headers["user-agent"],
    });

    console.log(`✅ Profile updated: ${updatedUser.email}`);

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      error: "Failed to update profile",
    });
  }
});

// Check if email exists (for signup validation)
router.post("/check-email", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    res.json({
      exists: !!existingUser,
      message: existingUser ? "Email already registered" : "Email available",
    });
  } catch (error) {
    console.error("Check email error:", error);
    res.status(500).json({ error: "Failed to check email" });
  }
});

export default router;