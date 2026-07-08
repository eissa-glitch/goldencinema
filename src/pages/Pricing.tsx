import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Check, Crown, Sparkles, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  max_views_per_month: number | null;
  features: string[];
  sort_order: number;
  is_active: boolean;
}

const iconFor = (i: number) => {
  if (i === 0) return Star;
  if (i === 1) return Sparkles;
  return Crown;
};

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plan: activePlan } = useSubscription();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as unknown as Plan[];
    },
  });

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      <main className="pt-32 pb-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-amiri font-bold text-gradient-gold mb-4">
            باقات الاشتراك
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            اختر الباقة المناسبة لك واستمتع بأرشيف السينما العربية بلا حدود
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">جاري التحميل...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, i) => {
              const Icon = iconFor(i);
              const isCurrent = activePlan?.plan_id === plan.id;
              const isFeatured = i === 1;
              return (
                <div
                  key={plan.id}
                  className={`cinema-card p-8 flex flex-col relative ${
                    isFeatured ? "border-gold glow-gold scale-105" : ""
                  }`}
                >
                  {isFeatured && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold text-background px-4 py-1 rounded-full text-sm font-bold">
                      الأكثر شعبية
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-gold" />
                    </div>
                    <h3 className="text-2xl font-amiri font-bold text-gold">
                      {plan.name}
                    </h3>
                  </div>

                  {plan.description && (
                    <p className="text-muted-foreground mb-6">{plan.description}</p>
                  )}

                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gradient-gold">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground mr-2">
                      {plan.currency} / شهر
                    </span>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {(plan.features || []).map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-foreground">
                        <Check className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Button disabled className="w-full">
                      باقتك الحالية
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        if (!user) {
                          navigate("/auth");
                          return;
                        }
                        const msg = encodeURIComponent(
                          `مرحباً، أريد الاشتراك في باقة "${plan.name}" (${plan.price} ${plan.currency}/شهر). بريدي: ${user.email}`
                        );
                        window.open(`https://wa.me/?text=${msg}`, "_blank");
                      }}
                      className="w-full cinema-button"
                    >
                      {plan.price === 0 ? "ابدأ مجاناً" : "اشترك الآن"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-12 text-muted-foreground text-sm">
          الدفع يدوي — بعد التواصل معنا، يقوم فريقنا بتفعيل اشتراكك خلال 24 ساعة.
          {!user && (
            <div className="mt-4">
              <Link to="/auth" className="text-gold hover:underline">
                سجّل الدخول أولاً
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
