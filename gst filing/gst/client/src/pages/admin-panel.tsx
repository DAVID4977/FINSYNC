import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Database, Users, FileText, History } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";

interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  gstin?: string;
  pan_number?: string;
  phone_number?: string;
  role: string;
  is_active: boolean;
  is_email_verified: boolean;
  last_login_at?: string;
  created_at: string;
}

interface UserSession {
  id: string;
  user_id: string;
  device_info?: string;
  ip_address?: string;
  expires_at: string;
  created_at: string;
}

interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  ip_address?: string;
  created_at: string;
}

interface UploadedFile {
  id: string;
  user_id: string;
  file_name: string;
  original_name: string;
  file_size?: number;
  file_type?: string;
  status: string;
  invoices_extracted: number;
  created_at: string;
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("users");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, sessionsRes, auditRes, filesRes] = await Promise.all([
        fetch('/api/admin/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('finsync_token')}` }
        }),
        fetch('/api/admin/sessions', {
          headers: { Authorization: `Bearer ${localStorage.getItem('finsync_token')}` }
        }),
        fetch('/api/admin/audit-logs', {
          headers: { Authorization: `Bearer ${localStorage.getItem('finsync_token')}` }
        }),
        fetch('/api/admin/uploaded-files', {
          headers: { Authorization: `Bearer ${localStorage.getItem('finsync_token')}` }
        })
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (sessionsRes.ok) setSessions(await sessionsRes.json());
      if (auditRes.ok) setAuditLogs(await auditRes.json());
      if (filesRes.ok) setUploadedFiles(await filesRes.json());
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold">Database Admin Panel</h1>
          <p className="text-muted-foreground">Manage and view database records</p>
        </div>
        <Button onClick={fetchData} disabled={loading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users ({users.length})
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Sessions ({sessions.length})
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Files ({uploadedFiles.length})
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Audit Logs ({auditLogs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>GSTIN</TableHead>
                      <TableHead>PAN</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.company || 'N/A'}</TableCell>
                        <TableCell>{user.gstin || 'N/A'}</TableCell>
                        <TableCell>{user.pan_number || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? 'default' : 'secondary'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.last_login_at ? formatDate(user.last_login_at) : 'Never'}</TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Monitor user sessions and device information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Device Info</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Expires At</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-mono text-sm">{session.user_id.substring(0, 8)}...</TableCell>
                        <TableCell className="max-w-xs truncate">{session.device_info || 'N/A'}</TableCell>
                        <TableCell>{session.ip_address || 'N/A'}</TableCell>
                        <TableCell>{formatDate(session.expires_at)}</TableCell>
                        <TableCell>{formatDate(session.created_at)}</TableCell>
                        <TableCell>
                          <Badge variant={new Date(session.expires_at) > new Date() ? 'default' : 'destructive'}>
                            {new Date(session.expires_at) > new Date() ? 'Valid' : 'Expired'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Files</CardTitle>
              <CardDescription>Track file uploads and processing status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Original Name</TableHead>
                      <TableHead>File Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Invoices Extracted</TableHead>
                      <TableHead>Uploaded</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadedFiles.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell className="font-medium">{file.original_name}</TableCell>
                        <TableCell>{file.file_type || 'N/A'}</TableCell>
                        <TableCell>{formatFileSize(file.file_size)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              file.status === 'completed' ? 'default' : 
                              file.status === 'processing' ? 'secondary' : 'destructive'
                            }
                          >
                            {file.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{file.invoices_extracted}</TableCell>
                        <TableCell>{formatDate(file.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>System activity and user actions audit trail</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity Type</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.action}</TableCell>
                        <TableCell>{log.entity_type}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.user_id ? `${log.user_id.substring(0, 8)}...` : 'System'}
                        </TableCell>
                        <TableCell>{log.ip_address || 'N/A'}</TableCell>
                        <TableCell>{formatDate(log.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}