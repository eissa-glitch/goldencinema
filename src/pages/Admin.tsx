import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useUserRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Film, Users, LogOut, Shield, Newspaper, FileText, Settings, Database, UserCog, CreditCard, Award } from "lucide-react";
import { toast } from "sonner";
import AdminMovies from "@/components/admin/AdminMovies";
import AdminArtists from "@/components/admin/AdminArtists";
import NewsTickerManager from "@/components/admin/NewsTickerManager";
import ContentManager from "@/components/admin/ContentManager";
import ApiSettingsManager from "@/components/admin/ApiSettingsManager";
import DatabaseExport from "@/components/admin/DatabaseExport";
import MembersManager from "@/components/admin/MembersManager";
import SubscriptionsManager from "@/components/admin/SubscriptionsManager";
import FestivalsManager from "@/components/admin/FestivalsManager";

const AUTHORIZED_EMAIL = "michaelmounir396@gmail.com";

const Admin = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("movies");

  const isAuthorizedUser = user?.email === AUTHORIZED_EMAIL;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!authLoading && !roleLoading && user && !isAuthorizedUser) {
      toast.error("غير مصرح لك بالوصول لهذه الصفحة");
      navigate("/");
    }
  }, [user, authLoading, roleLoading, isAuthorizedUser, navigate]);

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

  if (!user || !isAuthorizedUser) {
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
          <TabsList className="grid w-full max-w-6xl grid-cols-9">
            <TabsTrigger value="movies" className="flex items-center gap-2">
              <Film className="h-4 w-4" />
              الأفلام
            </TabsTrigger>
            <TabsTrigger value="artists" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              الفنانين
            </TabsTrigger>
            <TabsTrigger value="festivals" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              المهرجانات
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              الأعضاء
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              الاشتراكات
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              الأخبار
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              المحتوى
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              إعدادات API
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              تصدير البيانات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="movies">
            <AdminMovies />
          </TabsContent>

          <TabsContent value="artists">
            <AdminArtists />
          </TabsContent>

          <TabsContent value="festivals">
            <FestivalsManager />
          </TabsContent>

          <TabsContent value="members">
            <MembersManager />
          </TabsContent>

          <TabsContent value="subscriptions">
            <SubscriptionsManager />
          </TabsContent>

          <TabsContent value="news">
            <NewsTickerManager />
          </TabsContent>

          <TabsContent value="content">
            <ContentManager />
          </TabsContent>

          <TabsContent value="api">
            <ApiSettingsManager />
          </TabsContent>

          <TabsContent value="export">
            <DatabaseExport />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
