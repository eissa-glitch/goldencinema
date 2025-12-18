-- Create news_ticker table
CREATE TABLE public.news_ticker (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.news_ticker ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view active news" 
ON public.news_ticker 
FOR SELECT 
USING (is_active = true);

-- Admin write access
CREATE POLICY "Admins can manage news" 
ON public.news_ticker 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_news_ticker_updated_at
BEFORE UPDATE ON public.news_ticker
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default news items
INSERT INTO public.news_ticker (content, display_order) VALUES
  ('🎬 إصدار جديد: فيلم ''النيل والحياة'' يتصدر شباك التذاكر', 1),
  ('⭐ تكريم الفنان الكبير عادل إمام في مهرجان القاهرة السينمائي', 2),
  ('🏆 الفيلم المصري ''الإختيار'' يفوز بجائزة أفضل فيلم عربي', 3),
  ('📽️ مهرجان الجونة السينمائي يعلن عن قائمة الأفلام المشاركة', 4),
  ('🎭 إعادة ترميم فيلم ''باب الحديد'' بتقنية 4K', 5),
  ('🌟 نجمة جديدة تنضم لبطولة الفيلم القادم للمخرج يوسف شاهين', 6);