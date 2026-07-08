import { ReactNode, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Crown } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  movieId?: string;
  children: ReactNode;
}

const SubscriptionGuard = ({ movieId, children }: Props) => {
  const { user, loading: authLoading } = useAuth();
  const { plan, remaining, canView, isLoading } = useSubscription();
  const navigate = useNavigate();
  const recorded = useRef<string | null>(null);

  // Record a view once per movie when access is granted.
  useEffect(() => {
    if (!user?.id || !movieId || !canView) return;
    if (recorded.current === movieId) return;
    recorded.current = movieId;
    supabase
      .from("movie_views")
      .insert({ user_id: user.id, movie_id: movieId })
      .then(() => {});
  }, [user?.id, movieId, canView]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <Header />
        <main className="pt-40 pb-20 container mx-auto px-4 text-center">
          <Lock className="w-16 h-16 text-gold mx-auto mb-6" />
          <h1 className="text-3xl font-amiri font-bold text-gradient-gold mb-4">
            سجّل الدخول للمتابعة
          </h1>
          <p className="text-muted-foreground mb-8">
            يجب تسجيل الدخول لمشاهدة تفاصيل الأفلام
          </p>
          <Button onClick={() => navigate("/auth")} className="cinema-button">
            تسجيل الدخول
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (!plan || !plan.can_access_movies) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <Header />
        <main className="pt-40 pb-20 container mx-auto px-4 text-center">
          <Crown className="w-16 h-16 text-gold mx-auto mb-6" />
          <h1 className="text-3xl font-amiri font-bold text-gradient-gold mb-4">
            اشترك لمشاهدة الأفلام
          </h1>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            هذا المحتوى متاح للمشتركين فقط. اختر الباقة المناسبة لك واستمتع بأرشيفنا.
          </p>
          <Link to="/pricing" className="cinema-button inline-block">
            عرض الباقات
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (remaining <= 0) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <Header />
        <main className="pt-40 pb-20 container mx-auto px-4 text-center">
          <Lock className="w-16 h-16 text-gold mx-auto mb-6" />
          <h1 className="text-3xl font-amiri font-bold text-gradient-gold mb-4">
            استنفدت مشاهدات الشهر
          </h1>
          <p className="text-muted-foreground mb-8">
            وصلت للحد الأقصى من المشاهدات في باقة "{plan.plan_name}". رقّي باقتك للاستمتاع
            بمشاهدات أكثر.
          </p>
          <Link to="/pricing" className="cinema-button inline-block">
            ترقية الباقة
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return <>{children}</>;
};

export default SubscriptionGuard;
