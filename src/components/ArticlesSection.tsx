import { useState } from "react";
import { FileText, ExternalLink, Calendar, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Article {
  id: string;
  title: string;
  content: string | null;
  source: string | null;
  published_date: string | null;
  image_url: string | null;
}

interface ArticlesSectionProps {
  articles: Article[];
  title?: string;
}

const ArticlesSection = ({ articles, title = "مقالات وأخبار" }: ArticlesSectionProps) => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  if (!articles || articles.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-amiri font-bold text-gradient-gold mb-8 text-center">
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Card 
              key={article.id} 
              className="cinema-card overflow-hidden group cursor-pointer"
              onClick={() => setSelectedArticle(article)}
            >
              {article.image_url && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                </div>
              )}
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-3 line-clamp-2">{article.title}</h3>
                {article.content && (
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                    {article.content}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  {article.source && (
                    <span className="flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      {article.source}
                    </span>
                  )}
                  {article.published_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(article.published_date).toLocaleDateString("ar-EG")}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Article Reader Dialog */}
      <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && setSelectedArticle(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0" dir="rtl">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl font-amiri font-bold text-gradient-gold">
              {selectedArticle?.title}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-100px)]">
            <div className="p-6 pt-4">
              {selectedArticle?.image_url && (
                <div className="mb-6 rounded-lg overflow-hidden">
                  <img
                    src={selectedArticle.image_url}
                    alt={selectedArticle.title}
                    className="w-full max-h-[400px] object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                </div>
              )}
              
              <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
                {selectedArticle?.source && (
                  <span className="flex items-center gap-1">
                    <ExternalLink className="h-4 w-4" />
                    المصدر: {selectedArticle.source}
                  </span>
                )}
                {selectedArticle?.published_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(selectedArticle.published_date).toLocaleDateString("ar-EG", {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                )}
              </div>

              {selectedArticle?.content && (
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap text-lg">
                    {selectedArticle.content}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ArticlesSection;
