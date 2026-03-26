import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserPlus, Trash2, Shield, User, Loader2 } from "lucide-react";

interface ManagedUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  role: string;
  email_confirmed_at: string | null;
}

const callManageUsers = async (action: string, params: Record<string, any> = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const response = await supabase.functions.invoke("manage-users", {
    body: { action, ...params },
  });

  if (response.error) throw new Error(response.error.message);
  if (response.data?.error) throw new Error(response.data.error);
  return response.data;
};

const MembersManager = () => {
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => callManageUsers("list"),
  });

  const users: ManagedUser[] = usersData?.users || [];

  const createUserMutation = useMutation({
    mutationFn: (params: { email: string; password: string; role: string }) =>
      callManageUsers("create_user", params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("تم إنشاء العضو بنجاح");
      setShowAddDialog(false);
      setNewEmail("");
      setNewPassword("");
      setNewRole("user");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const setRoleMutation = useMutation({
    mutationFn: (params: { userId: string; role: string }) =>
      callManageUsers("set_role", params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("تم تحديث الصلاحية");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) =>
      callManageUsers("delete_user", { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("تم حذف العضو");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleCreateUser = () => {
    if (!newEmail || !newPassword) {
      toast.error("البريد الإلكتروني وكلمة المرور مطلوبان");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    createUserMutation.mutate({ email: newEmail, password: newPassword, role: newRole });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          إدارة الأعضاء والصلاحيات
        </CardTitle>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              إضافة عضو جديد
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة عضو جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1 block">البريد الإلكتروني</label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="email@example.com"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">كلمة المرور</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="كلمة المرور (6 أحرف على الأقل)"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">الصلاحية</label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">عضو عادي</SelectItem>
                    <SelectItem value="admin">مسؤول</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleCreateUser} 
                className="w-full"
                disabled={createUserMutation.isPending}
              >
                {createUserMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                ) : (
                  <UserPlus className="h-4 w-4 ml-2" />
                )}
                إنشاء العضو
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">لا يوجد أعضاء</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">البريد الإلكتروني</TableHead>
                <TableHead className="text-right">الصلاحية</TableHead>
                <TableHead className="text-right">تاريخ التسجيل</TableHead>
                <TableHead className="text-right">آخر دخول</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell dir="ltr" className="text-left font-mono text-sm">
                    {u.email}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={u.role}
                      onValueChange={(role) => setRoleMutation.mutate({ userId: u.id, role })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" /> عضو عادي
                          </span>
                        </SelectItem>
                        <SelectItem value="admin">
                          <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3" /> مسؤول
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString("ar-EG")}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {u.last_sign_in_at
                      ? new Date(u.last_sign_in_at).toLocaleDateString("ar-EG")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.email_confirmed_at ? "default" : "secondary"}>
                      {u.email_confirmed_at ? "مفعّل" : "غير مفعّل"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent dir="rtl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف العضو</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف {u.email}؟ لا يمكن التراجع عن هذا الإجراء.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-row-reverse gap-2">
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteUserMutation.mutate(u.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default MembersManager;
