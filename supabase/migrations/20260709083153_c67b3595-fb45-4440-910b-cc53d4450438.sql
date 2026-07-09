
-- Festivals table
CREATE TABLE public.festivals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  year INTEGER,
  edition TEXT,
  poster_url TEXT,
  cover_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.festivals TO anon, authenticated;
GRANT ALL ON public.festivals TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.festivals TO authenticated;
ALTER TABLE public.festivals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view festivals" ON public.festivals FOR SELECT USING (true);
CREATE POLICY "Admins manage festivals ins" ON public.festivals FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage festivals upd" ON public.festivals FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage festivals del" ON public.festivals FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_festivals_updated_at BEFORE UPDATE ON public.festivals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Gallery
CREATE TABLE public.festival_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES public.festivals(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.festival_gallery TO anon, authenticated;
GRANT ALL ON public.festival_gallery TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.festival_gallery TO authenticated;
ALTER TABLE public.festival_gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view festival_gallery" ON public.festival_gallery FOR SELECT USING (true);
CREATE POLICY "Admins ins festival_gallery" ON public.festival_gallery FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins upd festival_gallery" ON public.festival_gallery FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins del festival_gallery" ON public.festival_gallery FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Articles
CREATE TABLE public.festival_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES public.festivals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  source TEXT,
  published_date DATE,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.festival_articles TO anon, authenticated;
GRANT ALL ON public.festival_articles TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.festival_articles TO authenticated;
ALTER TABLE public.festival_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view festival_articles" ON public.festival_articles FOR SELECT USING (true);
CREATE POLICY "Admins ins festival_articles" ON public.festival_articles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins upd festival_articles" ON public.festival_articles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins del festival_articles" ON public.festival_articles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_festival_articles_updated_at BEFORE UPDATE ON public.festival_articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Videos
CREATE TABLE public.festival_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES public.festivals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.festival_videos TO anon, authenticated;
GRANT ALL ON public.festival_videos TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.festival_videos TO authenticated;
ALTER TABLE public.festival_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view festival_videos" ON public.festival_videos FOR SELECT USING (true);
CREATE POLICY "Admins ins festival_videos" ON public.festival_videos FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins upd festival_videos" ON public.festival_videos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins del festival_videos" ON public.festival_videos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
