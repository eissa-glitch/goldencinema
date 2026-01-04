-- Create site_content table for CMS
CREATE TABLE public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_key TEXT NOT NULL UNIQUE,
  content_value TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Anyone can view content
CREATE POLICY "Anyone can view site_content"
ON public.site_content
FOR SELECT
USING (true);

-- Only admins can manage content
CREATE POLICY "Admins can insert site_content"
ON public.site_content
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site_content"
ON public.site_content
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site_content"
ON public.site_content
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default content
INSERT INTO public.site_content (content_key, content_value, description) VALUES
('hero_title', 'الأرشيف السينمائي العربي', 'العنوان الرئيسي في الصفحة الرئيسية'),
('hero_description', 'اكتشف روائع السينما العربية من الحقبة الذهبية إلى اليوم. أكبر مجموعة من الأفلام العربية الكلاسيكية والحديثة في مكان واحد.', 'الوصف في الصفحة الرئيسية'),
('hero_badge', 'فيلم مميز', 'شارة الفيلم المميز'),
('btn_explore_movies', 'استكشف الأفلام', 'زر استكشاف الأفلام'),
('btn_browse_artists', 'تصفح الفنانين', 'زر تصفح الفنانين'),
('section_featured_movies', 'أفلام مميزة', 'عنوان قسم الأفلام المميزة'),
('section_featured_artists', 'نجوم السينما', 'عنوان قسم نجوم السينما'),
('section_view_all', 'عرض الكل', 'رابط عرض الكل'),
('cta_title', 'اكتشف تراث السينما العربية', 'عنوان قسم الدعوة للعمل'),
('cta_description', 'انضم إلينا في رحلة عبر الزمن لاكتشاف أجمل ما أنتجته السينما العربية', 'وصف قسم الدعوة للعمل'),
('cta_button', 'ابدأ الاستكشاف', 'زر الدعوة للعمل'),
('stat_movies', '١٠٠٠+', 'إحصائية الأفلام'),
('stat_movies_label', 'فيلم', 'تسمية إحصائية الأفلام'),
('stat_artists', '٥٠٠+', 'إحصائية الفنانين'),
('stat_artists_label', 'فنان', 'تسمية إحصائية الفنانين'),
('stat_years', '٧٠+', 'إحصائية السنوات'),
('stat_years_label', 'عام', 'تسمية إحصائية السنوات'),
('video_placeholder', 'اختر فيديو للمشاهدة', 'نص مشغل الفيديو الفارغ'),
('no_movies_message', 'لا توجد أفلام حالياً', 'رسالة عدم وجود أفلام'),
('no_artists_message', 'لا يوجد فنانون حالياً', 'رسالة عدم وجود فنانين');