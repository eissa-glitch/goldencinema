
-- 1) subscription_plans
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EGP',
  max_views_per_month integer,
  can_access_movies boolean NOT NULL DEFAULT true,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.subscription_plans TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscription_plans TO authenticated;
GRANT ALL ON public.subscription_plans TO service_role;

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans"
  ON public.subscription_plans FOR SELECT
  USING (true);

CREATE POLICY "Admins manage plans"
  ON public.subscription_plans FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) user_subscriptions
CREATE TABLE public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_subscriptions_user ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_active ON public.user_subscriptions(user_id, status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_subscriptions TO authenticated;
GRANT ALL ON public.user_subscriptions TO service_role;

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own subscriptions"
  ON public.user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage subscriptions"
  ON public.user_subscriptions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) movie_views
CREATE TABLE public.movie_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  movie_id uuid NOT NULL,
  viewed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_movie_views_user_time ON public.movie_views(user_id, viewed_at DESC);

GRANT SELECT, INSERT ON public.movie_views TO authenticated;
GRANT ALL ON public.movie_views TO service_role;

ALTER TABLE public.movie_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own views"
  ON public.movie_views FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users insert own views"
  ON public.movie_views FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 4) helper functions
CREATE OR REPLACE FUNCTION public.get_user_active_plan(_user_id uuid)
RETURNS TABLE (
  subscription_id uuid,
  plan_id uuid,
  plan_name text,
  price numeric,
  max_views_per_month integer,
  can_access_movies boolean,
  features jsonb,
  status text,
  started_at timestamptz,
  expires_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT us.id, sp.id, sp.name, sp.price, sp.max_views_per_month,
         sp.can_access_movies, sp.features, us.status, us.started_at, us.expires_at
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON sp.id = us.plan_id
  WHERE us.user_id = _user_id
    AND us.status = 'active'
    AND (us.expires_at IS NULL OR us.expires_at > now())
  ORDER BY us.started_at DESC
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.get_monthly_views_count(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int FROM public.movie_views
  WHERE user_id = _user_id
    AND viewed_at > (now() - interval '30 days')
$$;

CREATE OR REPLACE FUNCTION public.can_user_view_movie(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _plan record;
  _count int;
BEGIN
  SELECT * INTO _plan FROM public.get_user_active_plan(_user_id);
  IF _plan IS NULL OR NOT _plan.can_access_movies THEN
    RETURN false;
  END IF;
  IF _plan.max_views_per_month IS NULL THEN
    RETURN true;
  END IF;
  SELECT public.get_monthly_views_count(_user_id) INTO _count;
  RETURN _count < _plan.max_views_per_month;
END;
$$;

-- 5) seed 3 default plans
INSERT INTO public.subscription_plans (name, description, price, max_views_per_month, can_access_movies, features, sort_order)
VALUES
  ('مجاني', 'الباقة الأساسية للاستكشاف', 0, 5, true,
   '["تصفح قاعدة البيانات", "5 مشاهدات شهرياً", "الوصول لمعلومات أساسية"]'::jsonb, 1),
  ('فضي', 'الباقة الأنسب لمحبي السينما', 50, 30, true,
   '["30 مشاهدة شهرياً", "الوصول لكل تفاصيل الأفلام", "دعم فني عادي"]'::jsonb, 2),
  ('ذهبي', 'تجربة كاملة بدون حدود', 100, NULL, true,
   '["مشاهدات غير محدودة", "الوصول لكل المحتوى", "شارة عضو مميز", "دعم فني مميز"]'::jsonb, 3);
