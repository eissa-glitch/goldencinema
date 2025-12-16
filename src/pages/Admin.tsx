import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useUserRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Film, Users, LogOut, Shield } from "lucide-react";
import { toast } from "sonner";
import AdminMovies from "@/components/admin/AdminMovies";
import AdminArtists from "@/components/admin/AdminArtists";

const Admin = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("movies");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("تم تسجيل الخروج بنجاح");
    navigate("/");
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">لوحة التحكم</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            {isAdmin && (
              <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">
                مسؤول
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/")}>
              العودة للموقع
            </Button>
            <Button variant="destructive" onClick={handleSignOut}>
              <LogOut className="ml-2 h-4 w-4" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="movies" className="flex items-center gap-2">
              <Film className="h-4 w-4" />
              الأفلام
            </TabsTrigger>
            <TabsTrigger value="artists" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              الفنانين
            </TabsTrigger>
          </TabsList>

          <TabsContent value="movies">
            <AdminMovies />
          </TabsContent>

          <TabsContent value="artists">
            <AdminArtists />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
