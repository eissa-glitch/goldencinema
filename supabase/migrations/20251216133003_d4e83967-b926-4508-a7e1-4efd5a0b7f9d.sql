-- إنشاء storage bucket للصور
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- سياسات الوصول للـ bucket
CREATE POLICY "Anyone can view media" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can upload media" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update media" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete media" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'media' AND auth.role() = 'authenticated');

-- جدول المقالات للأفلام
CREATE TABLE public.movie_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  source TEXT,
  published_date DATE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول المقالات للفنانين
CREATE TABLE public.artist_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  source TEXT,
  published_date DATE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.movie_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_articles ENABLE ROW LEVEL SECURITY;

-- سياسات RLS للمقالات
CREATE POLICY "Anyone can view movie_articles" ON public.movie_articles FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert movie_articles" ON public.movie_articles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can update movie_articles" ON public.movie_articles FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can delete movie_articles" ON public.movie_articles FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view artist_articles" ON public.artist_articles FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert artist_articles" ON public.artist_articles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can update artist_articles" ON public.artist_articles FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can delete artist_articles" ON public.artist_articles FOR DELETE USING (auth.role() = 'authenticated');

-- Triggers للتحديث التلقائي
CREATE TRIGGER update_movie_articles_updated_at
  BEFORE UPDATE ON public.movie_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_artist_articles_updated_at
  BEFORE UPDATE ON public.artist_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();