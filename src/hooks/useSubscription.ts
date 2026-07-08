import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ActivePlan {
  subscription_id: string;
  plan_id: string;
  plan_name: string;
  price: number;
  max_views_per_month: number | null;
  can_access_movies: boolean;
  features: string[];
  status: string;
  started_at: string;
  expires_at: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();

  const planQuery = useQuery({
    queryKey: ["active-plan", user?.id],
    queryFn: async (): Promise<ActivePlan | null> => {
      if (!user?.id) return null;
      const { data, error } = await supabase.rpc("get_user_active_plan", {
        _user_id: user.id,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return row ? (row as ActivePlan) : null;
    },
    enabled: !!user?.id,
  });

  const viewsQuery = useQuery({
    queryKey: ["monthly-views", user?.id],
    queryFn: async (): Promise<number> => {
      if (!user?.id) return 0;
      const { data, error } = await supabase.rpc("get_monthly_views_count", {
        _user_id: user.id,
      });
      if (error) throw error;
      return (data as number) ?? 0;
    },
    enabled: !!user?.id,
  });

  const plan = planQuery.data ?? null;
  const monthlyViews = viewsQuery.data ?? 0;
  const remaining =
    plan?.max_views_per_month == null
      ? Infinity
      : Math.max(0, plan.max_views_per_month - monthlyViews);

  const canView =
    !!plan && plan.can_access_movies && remaining > 0;

  return {
    plan,
    monthlyViews,
    remaining,
    canView,
    isLoading: planQuery.isLoading || viewsQuery.isLoading,
    refetch: () => {
      planQuery.refetch();
      viewsQuery.refetch();
    },
  };
};
