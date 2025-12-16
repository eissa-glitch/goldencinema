import { useEffect, useState } from "react";
import { Newspaper, Sparkles } from "lucide-react";

const newsItems = [
  "🎬 إصدار جديد: فيلم 'النيل والحياة' يتصدر شباك التذاكر",
  "⭐ تكريم الفنان الكبير عادل إمام في مهرجان القاهرة السينمائي",
  "🏆 الفيلم المصري 'الإختيار' يفوز بجائزة أفضل فيلم عربي",
  "📽️ مهرجان الجونة السينمائي يعلن عن قائمة الأفلام المشاركة",
  "🎭 إعادة ترميم فيلم 'باب الحديد' بتقنية 4K",
  "🌟 نجمة جديدة تنضم لبطولة الفيلم القادم للمخرج يوسف شاهين",
];

const NewsTicker = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-gold/20 via-gold/10 to-gold/20 border-b border-gold/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 py-2 overflow-hidden">
          <div className="flex items-center gap-2 text-gold font-bold shrink-0">
            <Newspaper className="w-4 h-4" />
            <span className="text-sm">آخر الأخبار</span>
          </div>
          
          <div className="relative flex-1 overflow-hidden">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
              {[...newsItems, ...newsItems].map((news, idx) => (
                <span
                  key={idx}
                  className="text-sm text-foreground/90 inline-flex items-center gap-2"
                >
                  <Sparkles className="w-3 h-3 text-gold" />
                  {news}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;
