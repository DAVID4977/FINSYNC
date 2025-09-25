import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import db from "./db";
import { users, userSessions, uploadedFiles, auditLogs } from "../shared/schema";
import { authenticateToken, type AuthenticatedRequest } from "./auth";

const router = Router();

// Middleware to check if user is admin (you can add role-based access later)
const requireAdmin = async (req: AuthenticatedRequest, res: any, next: any) => {
  // For now, allow any authenticated user to access admin panel
  // You can add role checking later: if (req.user?.role !== 'admin') return res.status(403)...
  next();
};

// Get all users
router.get("/users", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        company: users.company,
        gstin: users.gstin,
        pan_number: users.panNumber,
        phone_number: users.phoneNumber,
        role: users.role,
        is_active: users.isActive,
        is_email_verified: users.isEmailVerified,
        last_login_at: users.lastLoginAt,
        created_at: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    res.json(allUsers);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all user sessions
router.get("/sessions", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const allSessions = await db
      .select({
        id: userSessions.id,
        user_id: userSessions.userId,
        device_info: userSessions.deviceInfo,
        ip_address: userSessions.ipAddress,
        expires_at: userSessions.expiresAt,
        created_at: userSessions.createdAt,
      })
      .from(userSessions)
      .orderBy(desc(userSessions.createdAt))
      .limit(100);

    res.json(allSessions);
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Get all uploaded files
router.get("/uploaded-files", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const allFiles = await db
      .select({
        id: uploadedFiles.id,
        user_id: uploadedFiles.userId,
        file_name: uploadedFiles.fileName,
        original_name: uploadedFiles.originalName,
        file_size: uploadedFiles.fileSize,
        file_type: uploadedFiles.fileType,
        status: uploadedFiles.status,
        invoices_extracted: uploadedFiles.invoicesExtracted,
        created_at: uploadedFiles.createdAt,
      })
      .from(uploadedFiles)
      .orderBy(desc(uploadedFiles.createdAt))
      .limit(100);

    res.json(allFiles);
  } catch (error) {
    console.error('Failed to fetch uploaded files:', error);
    res.status(500).json({ error: 'Failed to fetch uploaded files' });
  }
});

// Get audit logs
router.get("/audit-logs", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const logs = await db
      .select({
        id: auditLogs.id,
        user_id: auditLogs.userId,
        action: auditLogs.action,
        entity_type: auditLogs.entityType,
        entity_id: auditLogs.entityId,
        ip_address: auditLogs.ipAddress,
        created_at: auditLogs.createdAt,
      })
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(100);

    res.json(logs);
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;