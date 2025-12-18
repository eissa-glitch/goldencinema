import { useEffect, useState } from "react";
import { Newspaper, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NewsItem {
  id: string;
  content: string;
}

const NewsTicker = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      const { data } = await supabase
        .from("news_ticker")
        .select("id, content")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (data && data.length > 0) {
        setNewsItems(data);
      }
    };

    fetchNews();
  }, []);

  if (newsItems.length === 0) return null;

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
                  key={`${news.id}-${idx}`}
                  className="text-sm text-foreground/90 inline-flex items-center gap-2"
                >
                  <Sparkles className="w-3 h-3 text-gold" />
                  {news.content}
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
