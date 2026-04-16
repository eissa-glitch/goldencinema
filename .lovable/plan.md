

# إضافة دعم APIs إضافية لوظيفة OCR

## الوضع الحالي
وظيفة `extract-text-ocr` تدعم:
- OpenAI Chat Completions format (الافتراضي عبر Lovable AI)
- Google Generative Language API (كشف تلقائي من الرابط)

## الخطة: إضافة دعم لأنواع API إضافية

### 1. تعديل Edge Function (`supabase/functions/extract-text-ocr/index.ts`)
- إضافة كشف تلقائي لنوع API بناءً على الرابط:
  - `vision.googleapis.com` → Google Cloud Vision API
  - `cognitiveservices.azure.com` → Azure Computer Vision
  - `api.ocr.space` → OCR.space API
  - أي رابط آخر → يُعامل كـ OpenAI-compatible (الوضع الحالي)
- كل نوع يُرسل الطلب بالتنسيق المناسب للخدمة

### 2. تحديث واجهة إعدادات API (اختياري)
- إضافة قائمة منسدلة لاختيار نوع الخدمة عند إضافة API جديد بدلاً من الكشف التلقائي فقط

### التفاصيل التقنية
- كل نوع API يحتاج معالجة مختلفة للصورة (base64, URL, multipart)
- كل نوع يُرجع النتيجة بتنسيق مختلف يحتاج تحويل موحد

